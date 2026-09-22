import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  PaperclipIcon, 
  SendIcon, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Phone,
  Video,
  MoreVertical
} from "lucide-react"

export default function TenantMessagesPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl glass-card border border-border/50 p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-purple-500/10" />
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">Messages</h1>
              <p className="text-muted-foreground text-base md:text-lg">Communicate with your landlord and property management team.</p>
            </div>
            <Button className="btn-primary shadow-lg hover:shadow-xl w-full sm:w-auto">
              <Sparkles className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>
      </div>

      <div className="grid h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <User className="h-5 w-5" />
              </div>
              Conversations
            </CardTitle>
            <CardDescription>Your message history with property team</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {/* Active Conversation */}
              <div className="glass-card border border-border/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group m-2 rounded-2xl overflow-hidden">
                <Button variant="ghost" className="w-full justify-start rounded-2xl p-4 h-auto text-left">
                  <div className="flex w-full items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">JD</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-bold text-foreground group-hover:text-primary transition-colors">John Doe</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 px-2 py-1 text-xs font-semibold">
                            Landlord
                          </Badge>
                          <p className="text-xs text-muted-foreground">2h</p>
                        </div>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        Thanks for your message. I'll look into the maintenance issue right away.
                      </p>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Property Management */}
              <div className="glass-card border border-border/50 hover:border-green-300 hover:shadow-lg transition-all duration-300 group m-2 rounded-2xl overflow-hidden bg-primary/5">
                <Button variant="secondary" className="w-full justify-start rounded-2xl p-4 h-auto text-left bg-transparent hover:bg-primary/10">
                  <div className="flex w-full items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">PM</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-bold text-foreground group-hover:text-primary transition-colors">Property Management</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 px-2 py-1 text-xs font-semibold">
                            Active
                          </Badge>
                          <p className="text-xs text-muted-foreground">1d</p>
                        </div>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        We've scheduled the plumber to visit your apartment tomorrow between 10am-12pm.
                      </p>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Maintenance Team */}
              <div className="glass-card border border-border/50 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group m-2 rounded-2xl overflow-hidden">
                <Button variant="ghost" className="w-full justify-start rounded-2xl p-4 h-auto text-left">
                  <div className="flex w-full items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold">MT</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-bold text-foreground group-hover:text-primary transition-colors">Maintenance Team</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 px-2 py-1 text-xs font-semibold">
                            Completed
                          </Badge>
                          <p className="text-xs text-muted-foreground">3d</p>
                        </div>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        Your maintenance request #1234 has been completed. Please let us know if you need anything else.
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col lg:col-span-2">
          {/* Chat Header */}
          <CardHeader className="border-b border-dashed border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">PM</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">Property Management</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Usually responds within 2 hours
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="btn-outline hover:shadow-md">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="btn-outline hover:shadow-md">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="btn-outline hover:shadow-md">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
            {/* Incoming Message */}
            <div className="flex items-start gap-3">
              <Avatar className="mt-1 h-10 w-10 border-2 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">PM</AvatarFallback>
              </Avatar>
              <div className="glass-card border border-border/50 rounded-2xl p-4 max-w-[80%] bg-background/80 backdrop-blur-sm">
                <p className="text-sm text-foreground">Hello! How can we help you today?</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-muted-foreground">10:30 AM</p>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </div>

            {/* Outgoing Message */}
            <div className="flex items-start justify-end gap-3">
              <div className="glass-card border border-primary/50 rounded-2xl p-4 max-w-[80%] bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                <p className="text-sm">
                  Hi, I've noticed a leak under the kitchen sink. Could someone come take a look at it?
                </p>
                <div className="flex items-center gap-2 mt-2 justify-end">
                  <CheckCircle2 className="h-3 w-3 text-white/70" />
                  <p className="text-xs text-white/70">10:45 AM</p>
                </div>
              </div>
              <Avatar className="mt-1 h-10 w-10 border-2 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">ME</AvatarFallback>
              </Avatar>
            </div>

            {/* Incoming Message */}
            <div className="flex items-start gap-3">
              <Avatar className="mt-1 h-10 w-10 border-2 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">PM</AvatarFallback>
              </Avatar>
              <div className="glass-card border border-border/50 rounded-2xl p-4 max-w-[80%] bg-background/80 backdrop-blur-sm">
                <p className="text-sm text-foreground">
                  I'm sorry to hear that. We'll send a plumber to check it out. Is tomorrow between 10am-12pm a good
                  time for you?
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-muted-foreground">11:00 AM</p>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </div>

            {/* Outgoing Message */}
            <div className="flex items-start justify-end gap-3">
              <div className="glass-card border border-primary/50 rounded-2xl p-4 max-w-[80%] bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                <p className="text-sm">Yes, that works for me. Thank you!</p>
                <div className="flex items-center gap-2 mt-2 justify-end">
                  <CheckCircle2 className="h-3 w-3 text-white/70" />
                  <p className="text-xs text-white/70">11:05 AM</p>
                </div>
              </div>
              <Avatar className="mt-1 h-10 w-10 border-2 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">ME</AvatarFallback>
              </Avatar>
            </div>

            {/* Incoming Message */}
            <div className="flex items-start gap-3">
              <Avatar className="mt-1 h-10 w-10 border-2 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">PM</AvatarFallback>
              </Avatar>
              <div className="glass-card border border-border/50 rounded-2xl p-4 max-w-[80%] bg-background/80 backdrop-blur-sm">
                <p className="text-sm text-foreground">
                  Great! We've scheduled the plumber to visit your apartment tomorrow between 10am-12pm. Please make
                  sure someone is home to let them in.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-muted-foreground">11:15 AM</p>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>

          {/* Message Input */}
          <div className="border-t border-dashed border-border/50 p-4 md:p-6">
            <div className="glass-card border border-border/50 rounded-2xl p-3 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="shrink-0 btn-outline hover:shadow-md rounded-xl">
                  <PaperclipIcon className="h-4 w-4" />
                  <span className="sr-only">Attach file</span>
                </Button>
                <Input 
                  placeholder="Type your message..." 
                  className="flex-1 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-foreground placeholder:text-muted-foreground" 
                />
                <Button size="icon" className="shrink-0 btn-primary shadow-lg hover:shadow-xl rounded-xl">
                  <SendIcon className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
