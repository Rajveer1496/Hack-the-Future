import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription 
} from "@/components/ui/card";
import { UserList } from "@/components/network/user-list";
import { ConnectionsList } from "@/components/connection/connections-list";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Filter, UserPlus, UsersRound } from "lucide-react";

export default function NetworkPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Alumni Network</h1>
              <p className="text-slate-500 mt-1">
                Connect with alumni and students from your university
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <Tabs defaultValue="my-connections">
              <TabsList>
                <TabsTrigger value="my-connections" className="flex items-center">
                  <UsersRound className="h-4 w-4 mr-2" />
                  My Connections
                </TabsTrigger>
                <TabsTrigger value="find-connections" className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Connections
                </TabsTrigger>
              </TabsList>
              
              {/* My Connections Tab */}
              <TabsContent value="my-connections" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Network</CardTitle>
                    <CardDescription>
                      Manage your connections and connection requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConnectionsList />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Find Connections Tab */}
              <TabsContent value="find-connections" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Filters Sidebar */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Filter className="h-5 w-5 mr-2" />
                          Filters
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">User Type</label>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="alumni" className="rounded text-primary focus:ring-primary" defaultChecked />
                              <label htmlFor="alumni" className="text-sm">Alumni</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="students" className="rounded text-primary focus:ring-primary" defaultChecked />
                              <label htmlFor="students" className="text-sm">Current Students</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="mentors" className="rounded text-primary focus:ring-primary" defaultChecked />
                              <label htmlFor="mentors" className="text-sm">Mentors</label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Main Content */}
                  <div className="lg:col-span-3">
                    <Tabs defaultValue="all">
                      <Card>
                        <CardHeader className="px-6 py-5 border-b border-slate-200">
                          <TabsList className="border-b border-slate-200 w-full justify-start rounded-none bg-transparent p-0">
                            <TabsTrigger 
                              value="all"
                              className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                            >
                              All Users
                            </TabsTrigger>
                            <TabsTrigger 
                              value="alumni"
                              className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                            >
                              Alumni
                            </TabsTrigger>
                            <TabsTrigger 
                              value="students"
                              className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                            >
                              Students
                            </TabsTrigger>
                          </TabsList>
                        </CardHeader>
                        
                        <TabsContent value="all" className="pt-0 mt-0">
                          <UserList />
                        </TabsContent>
                        
                        <TabsContent value="alumni" className="pt-0 mt-0">
                          <UserList />
                        </TabsContent>
                        
                        <TabsContent value="students" className="pt-0 mt-0">
                          <UserList />
                        </TabsContent>
                      </Card>
                    </Tabs>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
