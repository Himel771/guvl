import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Calendar, Award, Camera, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  totalBalance: number;
  holdingsCount: number;
  transactionsCount: number;
  joinDate: string;
  avatarUrl: string | null;
  userId: string;
}

export const ProfileModal = ({
  isOpen,
  onClose,
  username,
  totalBalance,
  holdingsCount,
  transactionsCount,
  joinDate,
  avatarUrl,
  userId,
}: ProfileModalProps) => {
  const [uploading, setUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfile } = useAuth();

  const displayAvatarUrl = localAvatarUrl || avatarUrl;

  const memberSinceDate = new Date('2022-10-21');
  const formattedDate = memberSinceDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const filePath = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-busting param
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await updateProfile({ avatar_url: urlWithCacheBust });
      if (updateError) throw updateError;

      setLocalAvatarUrl(urlWithCacheBust);
      toast({ title: 'Avatar updated', description: 'Your profile picture has been updated.' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message || 'Could not upload avatar.', variant: 'destructive' });
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Avatar with upload */}
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden">
              {displayAvatarUrl ? (
                <img
                  src={displayAvatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={() => setLocalAvatarUrl(null)}
                />
              ) : (
                <span className="text-3xl font-bold text-black">{username[0]?.toUpperCase()}</span>
              )}
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white">
              Active
            </Badge>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {/* Username */}
          <div className="text-center">
            <h3 className="text-2xl font-bold">{username}</h3>
            <p className="text-sm text-muted-foreground">Crypto Trader</p>
          </div>

          {/* Stats Grid */}
          <div className="grid w-full grid-cols-2 gap-3">
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-col items-center gap-1 p-4">
                <Wallet className="h-5 w-5 text-amber-500" />
                <span className="text-lg font-bold">{formatCurrency(totalBalance)}</span>
                <span className="text-xs text-muted-foreground">Total Balance</span>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-col items-center gap-1 p-4">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-lg font-bold">{holdingsCount}</span>
                <span className="text-xs text-muted-foreground">Holdings</span>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-col items-center gap-1 p-4">
                <Award className="h-5 w-5 text-purple-500" />
                <span className="text-lg font-bold">{transactionsCount}</span>
                <span className="text-xs text-muted-foreground">Trades</span>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-col items-center gap-1 p-4">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-xs font-medium text-center">{formattedDate}</span>
                <span className="text-xs text-muted-foreground">Member Since</span>
              </CardContent>
            </Card>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
