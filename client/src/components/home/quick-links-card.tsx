import { Link } from "wouter";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { 
  User, 
  Briefcase, 
  Calendar, 
  Mail,
  FileText 
} from "lucide-react";

export default function QuickLinksCard() {
  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-slate-200">
        <CardTitle className="text-lg font-bold text-slate-800">Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3">
          <li>
            <Link href="/profile">
              <a className="flex items-center text-slate-700 hover:text-primary">
                <User className="h-5 w-5 mr-3 text-slate-400" />
                <span className="text-sm">Update Your Profile</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/resources?type=job">
              <a className="flex items-center text-slate-700 hover:text-primary">
                <Briefcase className="h-5 w-5 mr-3 text-slate-400" />
                <span className="text-sm">Browse Job Opportunities</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/events">
              <a className="flex items-center text-slate-700 hover:text-primary">
                <Calendar className="h-5 w-5 mr-3 text-slate-400" />
                <span className="text-sm">View All Events</span>
              </a>
            </Link>
          </li>
          <li>
            <a 
              href="mailto:support@alumniconnect.com" 
              className="flex items-center text-slate-700 hover:text-primary"
            >
              <Mail className="h-5 w-5 mr-3 text-slate-400" />
              <span className="text-sm">Contact Support</span>
            </a>
          </li>
          <li>
            <Link href="/network">
              <a className="flex items-center text-slate-700 hover:text-primary">
                <FileText className="h-5 w-5 mr-3 text-slate-400" />
                <span className="text-sm">Alumni Directory</span>
              </a>
            </Link>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
