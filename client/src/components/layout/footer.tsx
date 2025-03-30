import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  GraduationCap,
  Users,
  Network,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-100 mt-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="flex items-center mb-6">
            <div className="bg-blue-600 rounded-full p-3 mr-3">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              AlumniConnect
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-slate-600 text-lg max-w-xl text-center mb-6">
            Building bridges between alumni and students for mutual growth and development.
          </p>
          
          {/* Social Icons */}
          <div className="flex space-x-6 mb-8">
            <a
              href="#"
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
          
          {/* Features Icons */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <Link href="/mentorship">
              <a className="flex flex-col items-center group">
                <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="mt-2 text-slate-700 group-hover:text-blue-600 transition-colors">Mentorship</span>
              </a>
            </Link>
            <Link href="/events">
              <a className="flex flex-col items-center group">
                <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <span className="mt-2 text-slate-700 group-hover:text-blue-600 transition-colors">Events</span>
              </a>
            </Link>
            <Link href="/resources">
              <a className="flex flex-col items-center group">
                <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <span className="mt-2 text-slate-700 group-hover:text-blue-600 transition-colors">Resources</span>
              </a>
            </Link>
            <Link href="/network">
              <a className="flex flex-col items-center group">
                <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Network className="h-6 w-6 text-blue-600" />
                </div>
                <span className="mt-2 text-slate-700 group-hover:text-blue-600 transition-colors">Networking</span>
              </a>
            </Link>
          </div>
          
          <div className="mt-8 pt-4 border-t border-slate-200 w-full">
            <p className="text-base text-slate-500 text-center">
              &copy; {new Date().getFullYear()} AlumniConnect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
