
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, CheckCircle, AlertCircle, PlusCircle, Calendar } from 'lucide-react';

export function TeacherDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your classes and track student progress.</p>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-muted-foreground">Across 3 classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Students at risk</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Overview of your teaching assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Advanced English Grammar', students: 28, level: 'Advanced', schedule: 'Mon, Wed, Fri 10:00 AM' },
              { name: 'Business Communication', students: 32, level: 'Intermediate', schedule: 'Tue, Thu 2:00 PM' },
              { name: 'Conversation Club', students: 24, level: 'Mixed', schedule: 'Wed 6:00 PM' }
            ].map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{classItem.name}</h4>
                  <p className="text-sm text-muted-foreground">{classItem.schedule}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{classItem.level}</Badge>
                    <span className="text-sm text-muted-foreground">{classItem.students} students</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Student Activity</CardTitle>
            <CardDescription>Latest submissions and progress updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { student: 'Alice Johnson', activity: 'Submitted Essay #3', time: '2 hours ago', status: 'new' },
              { student: 'Bob Smith', activity: 'Completed Grammar Quiz', time: '4 hours ago', status: 'graded' },
              { student: 'Carol Davis', activity: 'Missed Assignment Deadline', time: '1 day ago', status: 'alert' },
              { student: 'David Wilson', activity: 'Excellent Speaking Test', time: '2 days ago', status: 'graded' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{activity.student}</h4>
                  <p className="text-sm text-muted-foreground">{activity.activity}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge 
                  variant={activity.status === 'new' ? 'default' : 
                           activity.status === 'alert' ? 'destructive' : 'secondary'}
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common teaching tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col">
              <PlusCircle className="h-6 w-6 mb-2" />
              New Assignment
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Grade Submissions
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Student Progress
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Class
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}