import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Calendar, 
  Briefcase,
  Activity,
  Star
} from "lucide-react";

function AdminDetails() {
  const [adminData] = useState({
    name: "John Doe",
    email: "admin@example.com",
    role: "Super Admin",
    lastLogin: new Date().toLocaleDateString(),
    activeProjects: 5,
    completedTasks: 125,
    pendingReviews: 8,
    performance: 92,
  });

  const statsConfig = [
    { label: "Email", value: adminData.email, icon: Mail, color: "emerald" },
    { label: "Last Login", value: adminData.lastLogin, icon: Calendar, color: "blue" },
    { label: "Active Projects", value: adminData.activeProjects, icon: Briefcase, color: "purple" },
  ];

  const activityConfig = [
    {
      label: "Completed Tasks",
      value: adminData.completedTasks,
      icon: CheckCircle,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      label: "Pending Reviews",
      value: adminData.pendingReviews,
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      label: "Performance",
      value: `${adminData.performance}%`,
      icon: Activity,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
  ];

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`p-6 max-w-7xl mx-auto `}
      initial="hidden"
      animate="show"
      variants={containerAnimation}
    >
      {/* Admin Header */}
      <motion.div 
        variants={itemAnimation}
        className="flex items-center space-x-6 mb-8"
      >
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl text-white font-bold">
              {adminData.name.charAt(0)}
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-400 rounded-full p-1.5">
            <Star className="w-4 h-4 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {adminData.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-medium">
              {adminData.role}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemAnimation}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {statsConfig.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemAnimation}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 bg-${stat.color}-400/10 rounded-lg`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-white font-medium">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity Cards */}
      <motion.div 
        variants={itemAnimation}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {activityConfig.map((activity, index) => (
          <motion.div
            key={index}
            variants={itemAnimation}
            className={`${activity.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${activity.textColor} font-medium mb-1`}>
                  {activity.label}
                </p>
                <p className={`text-3xl font-bold ${activity.textColor}`}>
                  {activity.value}
                </p>
              </div>
              <div className={`${activity.iconBg} p-3 rounded-xl`}>
                <activity.icon className={`w-6 h-6 ${activity.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default AdminDetails;