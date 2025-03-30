import { Link } from "wouter";
import { Home, Users, Calendar, FolderOpen, UserPlus } from "lucide-react";

interface MobileMenuProps {
  location: string;
}

export default function MobileMenu({ location }: MobileMenuProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
      <div className="flex justify-around py-3">
        <Link href="/">
          <div className={`group flex flex-col items-center px-2 transition-colors duration-200 ${
            location === '/' 
              ? 'text-primary' 
              : 'text-slate-500 hover:text-primary'
          }`}>
            <div className={`p-1 rounded-full mb-1 ${
              location === '/' 
                ? 'bg-primary/10' 
                : 'group-hover:bg-primary/5'
            }`}>
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Home</span>
          </div>
        </Link>
        
        <Link href="/network">
          <div className={`group flex flex-col items-center px-2 transition-colors duration-200 ${
            location === '/network' 
              ? 'text-primary' 
              : 'text-slate-500 hover:text-primary'
          }`}>
            <div className={`p-1 rounded-full mb-1 ${
              location === '/network' 
                ? 'bg-primary/10' 
                : 'group-hover:bg-primary/5'
            }`}>
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Network</span>
          </div>
        </Link>
        
        <Link href="/events">
          <div className={`group flex flex-col items-center px-2 transition-colors duration-200 ${
            location === '/events' 
              ? 'text-primary' 
              : 'text-slate-500 hover:text-primary'
          }`}>
            <div className={`p-1 rounded-full mb-1 ${
              location === '/events' 
                ? 'bg-primary/10' 
                : 'group-hover:bg-primary/5'
            }`}>
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Events</span>
          </div>
        </Link>
        
        <Link href="/resources">
          <div className={`group flex flex-col items-center px-2 transition-colors duration-200 ${
            location === '/resources' 
              ? 'text-primary' 
              : 'text-slate-500 hover:text-primary'
          }`}>
            <div className={`p-1 rounded-full mb-1 ${
              location === '/resources' 
                ? 'bg-primary/10' 
                : 'group-hover:bg-primary/5'
            }`}>
              <FolderOpen className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Resources</span>
          </div>
        </Link>
        
        <Link href="/mentorship">
          <div className={`group flex flex-col items-center px-2 transition-colors duration-200 ${
            location === '/mentorship' 
              ? 'text-primary' 
              : 'text-slate-500 hover:text-primary'
          }`}>
            <div className={`p-1 rounded-full mb-1 ${
              location === '/mentorship' 
                ? 'bg-primary/10' 
                : 'group-hover:bg-primary/5'
            }`}>
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Mentorship</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
