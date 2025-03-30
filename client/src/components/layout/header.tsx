import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Bell, MessageSquare } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import MobileMenu from "./mobile-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name?: string) => {
    if (!name) return "AC";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white shadow sticky top-0 z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent font-bold text-2xl cursor-pointer transition-transform hover:scale-105">
                AlumniConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:ml-10 md:flex md:space-x-8">
            <Link href="/">
              <span className={`font-medium border-b-2 px-3 py-5 text-sm transition-colors duration-150 ${location === '/' ? 'text-primary border-primary' : 'border-transparent text-slate-600 hover:text-primary hover:border-primary/30'}`}>
                Home
              </span>
            </Link>
            <Link href="/network">
              <span className={`font-medium border-b-2 px-3 py-5 text-sm transition-colors duration-150 ${location === '/network' ? 'text-primary border-primary' : 'border-transparent text-slate-600 hover:text-primary hover:border-primary/30'}`}>
                Network
              </span>
            </Link>
            <Link href="/events">
              <span className={`font-medium border-b-2 px-3 py-5 text-sm transition-colors duration-150 ${location === '/events' ? 'text-primary border-primary' : 'border-transparent text-slate-600 hover:text-primary hover:border-primary/30'}`}>
                Events
              </span>
            </Link>
            <Link href="/resources">
              <span className={`font-medium border-b-2 px-3 py-5 text-sm transition-colors duration-150 ${location === '/resources' ? 'text-primary border-primary' : 'border-transparent text-slate-600 hover:text-primary hover:border-primary/30'}`}>
                Resources
              </span>
            </Link>
            <Link href="/mentorship">
              <span className={`font-medium border-b-2 px-3 py-5 text-sm transition-colors duration-150 ${location === '/mentorship' ? 'text-primary border-primary' : 'border-transparent text-slate-600 hover:text-primary hover:border-primary/30'}`}>
                Mentorship
              </span>
            </Link>
          </nav>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-slate-600 hover:text-primary hover:bg-primary/10 focus:ring-2 focus:ring-primary/20"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-slate-600 hover:text-primary hover:bg-primary/10 focus:ring-2 focus:ring-primary/20"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Profile Dropdown */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-0 rounded-full hover:bg-primary/10 focus:ring-2 focus:ring-primary/20"
                >
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                    {user?.profilePicture ? (
                      <AvatarImage 
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`} 
                      />
                     ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(`${user?.firstName} ${user?.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center p-2">
                  <Avatar className="h-8 w-8 mr-2">
                    {user?.profilePicture ? (
                      <AvatarImage 
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`} 
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(`${user?.firstName} ${user?.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                    Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-primary/10 focus:text-primary" 
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu location={location} />
    </header>
  );
}
