interface TimetableData {
  semesterName?: string;
  workingDays?: string[];
  timeSlots?: Array<{ start: string; end: string }>;
  classrooms?: Array<{ id: string; name: string; capacity: number; type: string }>;
  laboratories?: Array<{ id: string; name: string; capacity: number; type: string }>;
  classes?: Array<{ id: string; name: string; strength: number; batch: string }>;
  subjects?: Array<{ id: string; name: string; code: string; hoursPerWeek: number; type: string; semester: number; credits: number }>;
  faculty?: Array<{ id: string; name: string; subjects: string[]; maxHoursPerWeek: number; availableDays: string[] }>;
  maxClassesPerDay?: number;
}

interface TimetableSlot {
  day: string;
  slotIndex: number;
  subject: string;
  faculty: string;
  room: string;
  type: string;
  classId: string;
}

export const generateTimetable = async (data: TimetableData): Promise<any> => {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  const {
    semesterName = "Generated Semester",
    workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:15', end: '12:15' },
      { start: '12:15', end: '13:15' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' }
    ],
    classrooms = [],
    laboratories = [],
    classes = [],
    subjects = [],
    faculty = [],
    maxClassesPerDay = 6
  } = data;

  // Combine all rooms (classrooms + labs)
  const allRooms = [...classrooms, ...laboratories];

  // Global room usage tracking
  const globalRoomUsage: { [key: string]: Set<string> } = {};
  allRooms.forEach(room => {
    globalRoomUsage[room.id] = new Set();
  });

  // Generate timetable for each class
  const generatedClasses = classes.map(classData => {
    const schedule: any = {};

    // Initialize empty schedule
    workingDays.forEach(day => {
      schedule[day] = new Array(timeSlots.length).fill(null);
    });

    // Track faculty workload
    const facultyWorkload: { [key: string]: number } = {};
    faculty.forEach(f => {
      facultyWorkload[f.id] = 0;
    });

    // Assign subjects to time slots with better distribution
    subjects.forEach(subject => {
      const subjectFaculty = faculty.filter(f => f.subjects.includes(subject.id));
      
      if (subjectFaculty.length === 0) return;

      // Try to assign the required hours per week for this subject
      let hoursAssigned = 0;
      const targetHours = subject.hoursPerWeek;

      // Create a shuffled list of day-slot combinations for better distribution
      const daySlotCombinations = [];
      for (const day of workingDays) {
        for (let slotIndex = 0; slotIndex < Math.min(timeSlots.length, maxClassesPerDay); slotIndex++) {
          daySlotCombinations.push({ day, slotIndex });
        }
      }
      
      // Shuffle the combinations to avoid clustering in Monday first slots
      for (let i = daySlotCombinations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [daySlotCombinations[i], daySlotCombinations[j]] = [daySlotCombinations[j], daySlotCombinations[i]];
      }

      for (const { day, slotIndex } of daySlotCombinations) {
        if (hoursAssigned >= targetHours) break;
        if (schedule[day][slotIndex] !== null) continue;

        // Find available faculty
        const availableFaculty = subjectFaculty.find(f => 
          f.availableDays.includes(day) &&
          facultyWorkload[f.id] < f.maxHoursPerWeek
        );

        if (!availableFaculty) continue;

        // Find available room
        const slotKey = `${day}-${slotIndex}`;
        const availableRoom = allRooms.find(room => {
          // Check room type compatibility
          const isCompatible = subject.type === 'Lab' ? 
            room.type.includes('Lab') : 
            true; // Theory subjects can use any room

          return isCompatible && 
                 !globalRoomUsage[room.id].has(slotKey) &&
                 room.capacity >= classData.strength;
        });

        if (!availableRoom) continue;

        // Assign the session
        schedule[day][slotIndex] = {
          subject: subject.name,
          subjectCode: subject.code,
          faculty: availableFaculty.name,
          room: availableRoom.name,
          type: subject.type,
          classId: classData.id
        };

        // Update tracking
        facultyWorkload[availableFaculty.id]++;
        globalRoomUsage[availableRoom.id].add(slotKey);
        hoursAssigned++;
      }
    });

    return {
      ...classData,
      schedule
    };
  });

  // Calculate statistics
  const totalUsedSlots = Object.values(globalRoomUsage).reduce((acc: number, usage: Set<string>) => acc + usage.size, 0);
  const totalAvailableSlots = allRooms.length * workingDays.length * timeSlots.length;
  
  const stats = {
    totalClasses: classes.length,
    totalSubjects: subjects.length,
    totalFaculty: faculty.length,
    roomUtilization: Math.round(totalAvailableSlots > 0 ? (totalUsedSlots / totalAvailableSlots) * 100 : 0)
  };

  // Generate faculty-wise timetables
  const facultyTimetables = faculty.map(facultyMember => {
    const schedule: any = {};
    
    // Initialize empty schedule for faculty
    workingDays.forEach(day => {
      schedule[day] = new Array(timeSlots.length).fill(null);
    });

    // Fill faculty schedule based on class schedules
    generatedClasses.forEach(classData => {
      workingDays.forEach(day => {
        timeSlots.forEach((_, slotIndex) => {
          const session = classData.schedule[day][slotIndex];
          if (session && session.faculty === facultyMember.name) {
            schedule[day][slotIndex] = {
              subject: session.subject,
              subjectCode: session.subjectCode,
              class: classData.name,
              batch: classData.batch,
              room: session.room,
              type: session.type
            };
          }
        });
      });
    });

    return {
      ...facultyMember,
      schedule
    };
  });

  return {
    semester: semesterName,
    workingDays,
    timeSlots,
    classes: generatedClasses,
    faculty: facultyTimetables,
    stats,
    generatedAt: new Date().toISOString()
  };
};