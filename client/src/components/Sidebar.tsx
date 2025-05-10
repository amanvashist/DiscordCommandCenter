import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="w-16 md:w-64 bg-discord-darker flex-shrink-0 transition-all overflow-hidden flex flex-col">
      <div className="p-4 flex items-center justify-center md:justify-start border-b border-discord-darkest">
        <div className="h-10 w-10 rounded-full bg-discord-blue flex items-center justify-center text-white font-bold">
          <i className="ri-robot-line text-xl"></i>
        </div>
        <span className="ml-3 font-semibold text-lg hidden md:block">Poppy Bot</span>
      </div>
      
      <nav className="p-2 flex-1">
        <Link href="/">
          <a className={`flex items-center p-2 mb-1 rounded hover:bg-discord-dark ${isActive('/') ? 'bg-discord-dark text-discord-blue' : 'text-white hover:text-discord-blue'} transition-colors`}>
            <i className="ri-dashboard-line text-xl"></i>
            <span className="ml-3 hidden md:block">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/users">
          <a className={`flex items-center p-2 mb-1 rounded hover:bg-discord-dark ${isActive('/users') ? 'bg-discord-dark text-discord-blue' : 'text-white hover:text-discord-blue'} transition-colors`}>
            <i className="ri-user-settings-line text-xl"></i>
            <span className="ml-3 hidden md:block">User Configuration</span>
          </a>
        </Link>
        
        <Link href="/commands">
          <a className={`flex items-center p-2 mb-1 rounded hover:bg-discord-dark ${isActive('/commands') ? 'bg-discord-dark text-discord-blue' : 'text-white hover:text-discord-blue'} transition-colors`}>
            <i className="ri-command-line text-xl"></i>
            <span className="ml-3 hidden md:block">Commands</span>
          </a>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-discord-darkest">
        <Link href="/login">
          <a className="flex items-center p-2 rounded hover:bg-discord-dark text-discord-light hover:text-white transition-colors">
            <i className="ri-logout-box-line text-xl"></i>
            <span className="ml-3 hidden md:block">Logout</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
