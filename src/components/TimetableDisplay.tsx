import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Printer, Calendar, MapPin, User, BookOpen, Users, GraduationCap } from "lucide-react";

interface TimetableDisplayProps {
  timetable: any;
  onBack: () => void;
}

export const TimetableDisplay = ({ timetable, onBack }: TimetableDisplayProps) => {
  const [viewType, setViewType] = useState<'classes' | 'faculty'>('classes');
  const [selectedItem, setSelectedItem] = useState<string>('');

  const handleExport = () => {
    // Implementation for exporting timetable
    console.log("Exporting timetable...");
  };

  const handlePrint = () => {
    window.print();
  };

  // Set default selection when view type changes
  const handleViewTypeChange = (type: 'classes' | 'faculty') => {
    setViewType(type);
    if (type === 'classes' && timetable?.classes?.length > 0) {
      setSelectedItem(timetable.classes[0].id);
    } else if (type === 'faculty' && timetable?.faculty?.length > 0) {
      setSelectedItem(timetable.faculty[0].id);
    }
  };

  // Initialize selection on first load
  if (!selectedItem && viewType === 'classes' && timetable?.classes?.length > 0) {
    setSelectedItem(timetable.classes[0].id);
  } else if (!selectedItem && viewType === 'faculty' && timetable?.faculty?.length > 0) {
    setSelectedItem(timetable.faculty[0].id);
  }

  const getCurrentData = () => {
    if (viewType === 'classes') {
      return timetable?.classes?.find((c: any) => c.id === selectedItem);
    } else {
      return timetable?.faculty?.find((f: any) => f.id === selectedItem);
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Form</span>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Generated Timetable</h2>
            <p className="text-muted-foreground">
              {timetable?.semester || 'Academic'} Semester • {timetable?.classes?.length || 0} Classes • {timetable?.faculty?.length || 0} Faculty
            </p>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Select value={viewType} onValueChange={handleViewTypeChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select view type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classes">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Class Timetables</span>
                  </div>
                </SelectItem>
                <SelectItem value="faculty">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Faculty Timetables</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {viewType === 'classes' && timetable?.classes && (
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {timetable.classes.map((classData: any) => (
                    <SelectItem key={classData.id} value={classData.id}>
                      {classData.name} - {classData.batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {viewType === 'faculty' && timetable?.faculty && (
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {timetable.faculty.map((facultyMember: any) => (
                    <SelectItem key={facultyMember.id} value={facultyMember.id}>
                      {facultyMember.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button onClick={handleExport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      {currentData && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              {viewType === 'classes' ? (
                <>
                  <span>{currentData.name}</span>
                  <Badge variant="secondary">{currentData.batch}</Badge>
                </>
              ) : (
                <>
                  <span>{currentData.name}</span>
                  <Badge variant="secondary">Faculty</Badge>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Time</th>
                    {timetable.workingDays?.map((day: string) => (
                      <th key={day} className="border border-border p-3 text-center font-semibold min-w-[150px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timetable.timeSlots?.map((slot: any, slotIndex: number) => (
                    <tr key={slotIndex} className="hover:bg-muted/30 transition-colors">
                      <td className="border border-border p-3 font-medium bg-academic-light/30">
                        <div className="text-sm">
                          <div className="font-semibold">{slot.start} - {slot.end}</div>
                          <div className="text-muted-foreground text-xs">Slot {slotIndex + 1}</div>
                        </div>
                      </td>
                      {timetable.workingDays?.map((day: string) => {
                        const session = currentData.schedule?.[day]?.[slotIndex];
                        return (
                          <td key={day} className="border border-border p-2">
                            {session ? (
                              <div className="bg-gradient-to-br from-primary/10 to-academic/10 rounded-lg p-3 border-l-4 border-primary">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1 text-sm font-semibold">
                                    <BookOpen className="h-3 w-3" />
                                    <span>{session.subject}</span>
                                  </div>
                                  {viewType === 'classes' ? (
                                    <>
                                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        <span>{session.faculty}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>{session.room}</span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <Users className="h-3 w-3" />
                                        <span>{session.class} - {session.batch}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>{session.room}</span>
                                      </div>
                                    </>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {session.type}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="h-16 flex items-center justify-center text-muted-foreground text-xs">
                                Free Period
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/10">
        <CardHeader>
          <CardTitle>Timetable Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{timetable?.stats?.totalClasses || 0}</div>
              <div className="text-sm text-muted-foreground">Total Classes</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{timetable?.stats?.totalSubjects || 0}</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
            <div className="text-center p-4 bg-academic/10 rounded-lg">
              <div className="text-2xl font-bold text-academic">{timetable?.stats?.totalFaculty || 0}</div>
              <div className="text-sm text-muted-foreground">Faculty</div>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">{timetable?.stats?.roomUtilization || 0}%</div>
              <div className="text-sm text-muted-foreground">Room Utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};