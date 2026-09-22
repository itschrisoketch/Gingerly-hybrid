import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  Search, 
  Plus, 
  FileText, 
  AlertTriangle,
  Info,
  Star,
  ThumbsUp,
  Book,
  Video,
  Download,
  ExternalLink,
  Send,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  Home,
  Settings
} from "lucide-react"

export default function TenantHelpPage() {
  // Sample FAQs data
  const faqs = [
    {
      id: 1,
      question: "How do I submit a maintenance request?",
      answer: "You can submit a maintenance request through your dashboard by going to the Maintenance section and clicking 'Submit Request'. Fill out the form with details about the issue, and we'll assign a technician to help you.",
      category: "Maintenance",
      helpful: 42
    },
    {
      id: 2,
      question: "When is rent due and how do I pay?",
      answer: "Rent is due on the 1st of each month. You can pay online through the Payments section of your dashboard using your bank account or credit card. Late fees apply after the 5th of the month.",
      category: "Payments",
      helpful: 38
    },
    {
      id: 3,
      question: "What should I do in case of an emergency?",
      answer: "For true emergencies (water leaks, gas leaks, electrical issues, break-ins), call our emergency hotline at (555) 911-HELP. For non-emergencies, submit a maintenance request through your dashboard.",
      category: "Emergency",
      helpful: 55
    },
    {
      id: 4,
      question: "Can I have guests stay overnight?",
      answer: "Yes, you can have guests stay overnight. However, guests cannot stay for more than 14 consecutive days or 30 total days in a year without prior approval from management.",
      category: "Lease",
      helpful: 29
    },
    {
      id: 5,
      question: "How do I request apartment maintenance or repairs?",
      answer: "Use the maintenance request form in your tenant dashboard. Include photos if possible and describe the issue in detail. Non-emergency requests are typically addressed within 2-3 business days.",
      category: "Maintenance",
      helpful: 41
    },
    {
      id: 6,
      question: "What amenities are included with my rent?",
      answer: "Your rent includes access to the fitness center, pool, community room, and laundry facilities. WiFi in common areas and basic cable are also included. Individual apartment utilities may vary by lease.",
      category: "Amenities",
      helpful: 33
    }
  ]

  // Sample support tickets
  const supportTickets = [
    {
      id: "#SUP-001",
      subject: "Unable to access fitness center",
      status: "open",
      priority: "medium",
      created: "2024-05-01",
      lastUpdated: "2024-05-02",
      description: "My key card doesn't work for the fitness center door."
    },
    {
      id: "#SUP-002", 
      subject: "Question about lease renewal",
      status: "resolved",
      priority: "low",
      created: "2024-04-28",
      lastUpdated: "2024-04-29",
      description: "I have questions about the lease renewal process and timeline."
    },
    {
      id: "#SUP-003",
      subject: "Noise complaint - Unit 3C",
      status: "in-progress",
      priority: "high", 
      created: "2024-04-30",
      lastUpdated: "2024-05-01",
      description: "Ongoing noise issues from the unit above during late hours."
    }
  ]

  // Sample resources
  const resources = [
    {
      id: 1,
      title: "Tenant Handbook",
      type: "PDF",
      size: "2.4 MB",
      description: "Complete guide to living in our community",
      category: "Documentation"
    },
    {
      id: 2,
      title: "Maintenance Request Tutorial",
      type: "Video",
      duration: "3:45",
      description: "Step-by-step guide to submitting maintenance requests",
      category: "Tutorial"
    },
    {
      id: 3,
      title: "Community Rules & Guidelines",
      type: "PDF",
      size: "890 KB",
      description: "Important policies and community standards",
      category: "Documentation"
    },
    {
      id: 4,
      title: "Emergency Procedures",
      type: "PDF",
      size: "1.2 MB",
      description: "What to do in case of various emergency situations",
      category: "Safety"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl glass-card border border-border/50 p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-green-500/10" />
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-green-600 text-white shadow-lg">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">Help & Support</h1>
              <p className="text-muted-foreground text-base md:text-lg">Get help with your questions and access helpful resources.</p>
            </div>
            <Button className="btn-primary shadow-lg hover:shadow-xl w-full sm:w-auto">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group overflow-hidden cursor-pointer">
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-100/50 dark:from-blue-950/30 dark:to-cyan-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Phone className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">Emergency Line</h3>
                <p className="text-muted-foreground">24/7 emergency support</p>
                <p className="text-lg font-bold text-primary mt-2">(555) 911-HELP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group overflow-hidden cursor-pointer">
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Mail className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">Email Support</h3>
                <p className="text-muted-foreground">Get help via email</p>
                <p className="text-sm font-medium text-primary mt-2">support@gingerly.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group overflow-hidden cursor-pointer">
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-100/50 dark:from-orange-950/30 dark:to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Clock className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">Office Hours</h3>
                <p className="text-muted-foreground">Monday - Friday</p>
                <p className="text-sm font-medium text-primary mt-2">9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="glass-card border border-border/50 p-1 bg-background/80 backdrop-blur-sm rounded-2xl shadow-md w-full md:w-auto">
          <TabsTrigger 
            value="faq" 
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 flex-1 md:flex-none"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger 
            value="tickets"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 flex-1 md:flex-none"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger 
            value="resources"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 flex-1 md:flex-none"
          >
            <Book className="mr-2 h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger 
            value="contact"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 flex-1 md:flex-none"
          >
            <Phone className="mr-2 h-4 w-4" />
            Contact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search */}
          <div className="glass-card border border-border/50 p-6 rounded-2xl bg-background/80 backdrop-blur-sm">
            <div className="relative">
              <Search className="input-icon" />
              <Input 
                type="search" 
                placeholder="Search frequently asked questions..." 
                className="input-modern pl-10"
              />
            </div>
          </div>

          <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                  <HelpCircle className="h-5 w-5" />
                </div>
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="text-base">Find answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={faq.id} className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-200 flex-1">
                          {faq.question}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 px-2 py-1 text-xs font-semibold">
                            {faq.category}
                          </Badge>
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{faq.helpful} people found this helpful</span>
                        </div>
                        <Button variant="outline" size="sm" className="btn-outline">
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Helpful
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Support Tickets</h2>
              <p className="text-muted-foreground">Track your support requests and get help</p>
            </div>
            <Button className="btn-primary w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>

          <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
                Your Support Tickets
              </CardTitle>
              <CardDescription className="text-base">View and manage your support requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {supportTickets.map((ticket, i) => (
                <Card key={ticket.id} className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-2xl ${
                          ticket.status === 'open'
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-600'
                            : ticket.status === 'in-progress'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600'
                        } flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {ticket.status === 'open' && <AlertTriangle className="h-6 w-6" />}
                          {ticket.status === 'in-progress' && <Clock className="h-6 w-6" />}
                          {ticket.status === 'resolved' && <CheckCircle className="h-6 w-6" />}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="font-bold text-lg group-hover:text-primary transition-colors duration-200">{ticket.subject}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 px-2 py-1 text-xs font-semibold">
                                {ticket.id}
                              </Badge>
                              <Badge className={`px-2 py-1 text-xs font-semibold ${
                                ticket.priority === 'high'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200'
                                  : ticket.priority === 'medium'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
                              }`}>
                                {ticket.priority} priority
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created: {ticket.created}</span>
                            <span>• Last updated: {ticket.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`px-3 py-1 font-semibold ${
                          ticket.status === 'open'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200'
                            : ticket.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
                        }`}>
                          {ticket.status === 'open' ? 'Open' : ticket.status === 'in-progress' ? 'In Progress' : 'Resolved'}
                        </Badge>
                        <Button variant="outline" size="sm" className="btn-outline hover:shadow-md">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <Book className="h-5 w-5" />
                </div>
                Helpful Resources
              </CardTitle>
              <CardDescription className="text-base">Guides, tutorials, and documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.map((resource, i) => (
                <Card key={resource.id} className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-2xl ${
                          resource.type === 'PDF'
                            ? 'bg-gradient-to-r from-red-500 to-pink-600'
                            : 'bg-gradient-to-r from-purple-500 to-blue-600'
                        } flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {resource.type === 'PDF' ? <FileText className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="font-bold text-lg group-hover:text-primary transition-colors duration-200">{resource.title}</p>
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 px-2 py-1 text-xs font-semibold w-fit">
                              {resource.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{resource.type}</span>
                            {resource.size && <span>• {resource.size}</span>}
                            {resource.duration && <span>• {resource.duration}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button variant="outline" size="sm" className="btn-outline hover:shadow-md">
                          {resource.type === 'PDF' ? <Download className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                          <span className="hidden sm:inline">{resource.type === 'PDF' ? 'Download' : 'Watch'}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 text-white">
                    <Send className="h-5 w-5" />
                  </div>
                  Send us a message
                </CardTitle>
                <CardDescription className="text-base">Get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="What can we help you with?" className="input-modern" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select>
                    <SelectTrigger className="glass border border-border/50 rounded-xl">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="payments">Payments</SelectItem>
                      <SelectItem value="lease">Lease Questions</SelectItem>
                      <SelectItem value="amenities">Amenities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger className="glass border border-border/50 rounded-xl">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Please describe your issue or question in detail..." 
                    className="min-h-[120px] resize-none glass border border-border/50 rounded-xl"
                  />
                </div>
                <Button className="w-full btn-primary">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Info className="h-5 w-5" />
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Emergency Hotline</p>
                      <p className="text-lg font-bold text-primary">(555) 911-HELP</p>
                      <p className="text-sm text-muted-foreground">Available 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Office</p>
                      <p className="text-lg font-bold text-primary">(555) 123-4567</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri 9AM-5PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Email Support</p>
                      <p className="text-lg font-bold text-primary">support@gingerly.com</p>
                      <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full btn-outline justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Submit Maintenance Request
                  </Button>
                  <Button variant="outline" className="w-full btn-outline justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" className="w-full btn-outline justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Community Guidelines
                  </Button>
                  <Button variant="outline" className="w-full btn-outline justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 