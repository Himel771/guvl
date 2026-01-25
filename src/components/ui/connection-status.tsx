import { Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus = ({ isConnected }: ConnectionStatusProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {isConnected ? (
              <>
                <motion.div
                  className="h-2 w-2 rounded-full bg-emerald-500"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 hidden sm:inline">Live</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground hidden sm:inline">Offline</span>
              </>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isConnected ? 'Real-time prices connected' : 'Connecting to live prices...'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
