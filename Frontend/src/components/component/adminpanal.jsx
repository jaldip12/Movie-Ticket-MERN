import React from 'react';
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  CalendarIcon,
  DollarSignIcon,
  FilmIcon,
  LayoutGridIcon,
  MapPinIcon,
  MoveHorizontalIcon,
  ShoppingCartIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  SearchIcon,
} from "lucide-react";
import { motion } from 'framer-motion';

export function AdminPanel() {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 shadow-lg">
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-2xl font-bold text-yellow-400">cinépolis</h1>
        </div>
        <nav className="p-4">
          {[
            { icon: LayoutGridIcon, label: "Dashboard", path: "/admin" },
            { icon: FilmIcon, label: "Movies", path: "/movies" },
            { icon: MapPinIcon, label: "Theaters", path: "/theaters" },
            { icon: CalendarIcon, label: "Bookings", path: "/bookings" },
            { icon: UsersIcon, label: "Users", path: "/users" },
            { icon: SettingsIcon, label: "Settings", path: "/settings" },
          ].map(({ icon: Icon, label, path }) => (
            <Link
              key={label}
              to={path}
              className="flex items-center gap-3 p-3 rounded-md text-gray-300 hover:text-yellow-400 hover:bg-gray-700 transition-all duration-300"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-300 hover:text-yellow-400 hover:bg-gray-600 transition-colors duration-300">
            <LogOutIcon className="h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-yellow-400"
          >
            Dashboard
          </motion.h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "Total Bookings", value: "12,345", icon: ShoppingCartIcon, color: "bg-blue-600" },
            { label: "Total Revenue", value: "$123,456", icon: DollarSignIcon, color: "bg-green-600" },
            { label: "New Users", value: "1,234", icon: UsersIcon, color: "bg-yellow-600" },
            { label: "Upcoming Shows", value: "78", icon: CalendarIcon, color: "bg-purple-600" },
          ].map(({ label, value, icon: Icon, color }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow bg-gray-700 text-white border-none">
                <CardHeader className={`flex justify-between items-center ${color} rounded-t-lg py-3`}>
                  <div className="text-sm font-medium">{label}</div>
                  <Icon className="h-6 w-6" />
                </CardHeader>
                <CardContent className="text-2xl font-bold pt-4">{value}</CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Movies Table */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Recent Movies</h2>
          <Card className="bg-gray-700 text-white border-none overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Genre</TableHead>
                  <TableHead className="text-gray-300">Release Date</TableHead>
                  <TableHead className="text-gray-300">Show Timings</TableHead>
                  <TableHead className="text-right text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    title: "Avengers: Endgame",
                    genre: "Action, Adventure, Sci-Fi",
                    date: "April 26, 2019",
                    timings: "10:00 AM, 2:00 PM, 6:00 PM",
                  },
                  {
                    title: "The Shawshank Redemption",
                    genre: "Drama",
                    date: "September 22, 1994",
                    timings: "1:00 PM, 4:30 PM, 8:00 PM",
                  },
                  {
                    title: "Inception",
                    genre: "Action, Adventure, Sci-Fi",
                    date: "July 16, 2010",
                    timings: "11:30 AM, 3:00 PM, 7:30 PM",
                  },
                ].map(({ title, genre, date, timings }) => (
                  <TableRow key={title} className="hover:bg-gray-600 transition-colors duration-200">
                    <TableCell className="font-medium">{title}</TableCell>
                    <TableCell>{genre}</TableCell>
                    <TableCell>{date}</TableCell>
                    <TableCell>{timings}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-yellow-400">
                            <MoveHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-700 text-white">
                          <DropdownMenuItem className="hover:bg-gray-600 hover:text-yellow-400">Edit</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-gray-600 hover:text-yellow-400">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.section>

        {/* Theaters Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Top Theaters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Cinépolis VIP", location: "Ahmedabad", capacity: 150 },
              { name: "INOX Megaplex", location: "Mumbai", capacity: 200 },
              { name: "PVR Directors Cut", location: "Delhi", capacity: 180 },
            ].map((theater, index) => (
              <Card key={index} className="bg-gray-700 text-white border-none hover:shadow-lg transition-shadow">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-yellow-400">{theater.name}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Location: {theater.location}</p>
                  <p className="text-gray-300">Capacity: {theater.capacity} seats</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
