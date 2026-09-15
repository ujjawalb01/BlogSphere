import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BiHomeAlt, BiSearch, BiPlusCircle, BiMessageRoundedDots, BiUser } from "react-icons/bi";

export default function BottomNav() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#171817]/95 px-4 pb-6 pt-4 backdrop-blur-md md:hidden">
      <div className="flex justify-around items-center">
        <Link to="/" className={`text-2xl ${isActive("/") ? "text-indigo-400" : "text-gray-400"}`}>
          <BiHomeAlt />
        </Link>
        
        <Link to="/search" className={`text-2xl ${isActive("/search") ? "text-indigo-400" : "text-gray-400"}`}>
          <BiSearch />
        </Link>
        
        <Link to="/create" className="-mt-8 rounded-full border-4 border-[#171817] bg-[#171817] p-1 text-4xl text-[#d9ff65]">
           <BiPlusCircle />
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
