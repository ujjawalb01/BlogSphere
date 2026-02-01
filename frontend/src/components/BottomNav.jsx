import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BiHomeAlt, BiSearch, BiPlusCircle, BiMessageRoundedDots, BiUser } from "react-icons/bi";

export default function BottomNav() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10 p-4 md:hidden z-50 pb-6">
      <div className="flex justify-around items-center">
        <Link to="/" className={`text-2xl ${isActive("/") ? "text-indigo-400" : "text-gray-400"}`}>
          <BiHomeAlt />
        </Link>
        
        <Link to="/search" className={`text-2xl ${isActive("/search") ? "text-indigo-400" : "text-gray-400"}`}>
          <BiSearch />
        </Link>
        
        <Link to="/create" className="text-4xl text-indigo-500 -mt-8 bg-gray-900 rounded-full p-1 border-4 border-gray-900">
           <BiPlusCircle className="bg-white rounded-full text-indigo-600" />
        </Link>
        
        <Link to="/messenger" className={`text-2xl relative ${isActive("/messenger") ? "text-indigo-400" : "text-gray-400"}`}>
          <BiMessageRoundedDots />
          {/* We could add badge here too if we want */}
        </Link>
        
        <Link to={user ? "/profile" : "/login"} className={`text-2xl ${isActive("/profile") ? "text-indigo-400" : "text-gray-400"}`}>
           {user ? (
               <div className={`w-6 h-6 rounded-full overflow-hidden border-2 ${isActive("/profile") ? "border-indigo-500" : "border-gray-500"}`}>
                   <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="w-full h-full object-cover" />
               </div>
           ) : (
               <BiUser />
           )}
        </Link>
      </div>
    </div>
  );
}
