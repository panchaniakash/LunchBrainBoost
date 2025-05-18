import { HomeIcon, GamesIcon, SettingsIcon } from "@/components/ui/icons";
import { Link, useLocation } from "wouter";

export function Footer() {
  const [location] = useLocation();

  return (
    <footer className="bg-white border-t border-neutral-200 py-3 px-4 mt-auto">
      <div className="container mx-auto">
        <div className="flex justify-center space-x-6 text-neutral-300">
          <Link href="/">
            <a className={`flex flex-col items-center ${location === "/" ? "text-primary" : ""}`}>
              <HomeIcon />
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          
          <button className="flex flex-col items-center">
            <GamesIcon />
            <span className="text-xs mt-1">Games</span>
          </button>
          
          <button className="flex flex-col items-center">
            <SettingsIcon />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
