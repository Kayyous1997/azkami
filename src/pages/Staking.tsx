import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Coins, Lock, Unlock, Trophy, Zap, Calendar, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

// Mock NFT data - replace with actual contract calls
const mockNFTs = [
  {
    id: 1,
    name: 'AZKAMI Genesis #001',
    image: '/placeholder.svg',
    rarity: 'Legendary',
    stakingPower: 100,
    isStaked: false,
  },
  {
    id: 2,
    name: 'AZKAMI Genesis #042',
    image: '/placeholder.svg',
    rarity: 'Epic',
    stakingPower: 75,
    isStaked: true,
    stakedAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
  },
  {
    id: 3,
    name: 'AZKAMI Genesis #123',
    image: '/placeholder.svg',
    rarity: 'Rare',
    stakingPower: 50,
    isStaked: false,
  },
];

const STAKING_CONTRACT = '0x1234567890123456789012345678901234567890'; // Replace with actual contract

type StakingPeriod = 'daily' | 'weekly' | 'monthly';

const STAKING_PERIODS = {
  daily: { label: 'Daily', multiplier: 1, lockDays: 1 },
  weekly: { label: 'Weekly', multiplier: 1.5, lockDays: 7 },
  monthly: { label: 'Monthly', multiplier: 2.5, lockDays: 30 },
};

const Staking = () => {
  const { address, isConnected } = useAccount();
  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);
  const [stakingPeriod, setStakingPeriod] = useState<StakingPeriod>('weekly');
  const [totalStaked, setTotalStaked] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [stakingAPY, setStakingAPY] = useState(125); // 125% APY

  // Calculate staking stats
  useEffect(() => {
    const stakedNFTs = mockNFTs.filter(nft => nft.isStaked);
    const totalPower = stakedNFTs.reduce((sum, nft) => sum + nft.stakingPower, 0);
    setTotalStaked(totalPower);

    // Calculate pending rewards (mock calculation)
    const totalRewards = stakedNFTs.reduce((sum, nft) => {
      if (nft.stakedAt) {
        const daysStaked = Math.floor((Date.now() - nft.stakedAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + (nft.stakingPower * 0.1 * daysStaked); // 0.1 AZK per day per staking power
      }
      return sum;
    }, 0);
    setPendingRewards(totalRewards);
  }, []);

  const handleStakeMultipleNFTs = async () => {
    if (selectedNFTs.length === 0) {
      toast({
        title: "No NFTs Selected",
        description: "Please select at least one NFT to stake.",
        variant: "destructive",
      });
      return;
    }

    try {
      const period = STAKING_PERIODS[stakingPeriod];
      toast({
        title: "Staking NFTs",
        description: `Staking ${selectedNFTs.length} NFTs for ${period.label.toLowerCase()} on Monad blockchain...`,
      });
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "NFTs Staked Successfully!",
        description: `${selectedNFTs.length} NFTs are now earning $AZK rewards with ${period.multiplier}x multiplier.`,
      });
      setSelectedNFTs([]);
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleStakeNFT = async (nftId: number) => {
    try {
      const period = STAKING_PERIODS[stakingPeriod];
      toast({
        title: "Staking NFT",
        description: `Transaction submitted to Monad blockchain for ${period.label.toLowerCase()} staking...`,
      });
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "NFT Staked Successfully!",
        description: `Your NFT is now earning $AZK rewards with ${period.multiplier}x multiplier.`,
      });
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleUnstakeNFT = async (nftId: number) => {
    try {
      toast({
        title: "Unstaking NFT",
        description: "Transaction submitted to Monad blockchain...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "NFT Unstaked Successfully!",
        description: "Your NFT has been returned to your wallet.",
      });
    } catch (error) {
      toast({
        title: "Unstaking Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleClaimRewards = async () => {
    try {
      toast({
        title: "Claiming Rewards",
        description: "Transaction submitted to Monad blockchain...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rewards Claimed!",
        description: `${pendingRewards.toFixed(2)} $AZK tokens have been sent to your wallet.`,
      });
      setPendingRewards(0);
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-gradient-primary';
      case 'Epic': return 'bg-accent';
      case 'Rare': return 'bg-chart-4';
      default: return 'bg-muted';
    }
  };

  const toggleNFTSelection = (nftId: number) => {
    setSelectedNFTs(prev => 
      prev.includes(nftId) 
        ? prev.filter(id => id !== nftId)
        : [...prev, nftId]
    );
  };

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                Connect Your Wallet
              </CardTitle>
              <p className="text-muted-foreground">
                Connect your wallet to start staking NFTs and earning $AZK rewards on Monad
              </p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ConnectButton />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AZKAMI Staking
            </h1>
            <p className="text-muted-foreground mt-2">
              Stake your NFTs on Monad to earn $AZK rewards
            </p>
          </div>
          <ConnectButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Staked</span>
              </div>
              <p className="text-2xl font-bold mt-2">{totalStaked}</p>
              <p className="text-xs text-muted-foreground">Staking Power</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">Pending Rewards</span>
              </div>
              <p className="text-2xl font-bold mt-2">{pendingRewards.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">$AZK Tokens</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-warning" />
                <span className="text-sm text-muted-foreground">Current APY</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stakingAPY}%</p>
              <p className="text-xs text-muted-foreground">Annual Percentage Yield</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-success" />
                <span className="text-sm text-muted-foreground">Network</span>
              </div>
              <p className="text-2xl font-bold mt-2">Monad</p>
              <p className="text-xs text-muted-foreground">Blockchain</p>
            </CardContent>
          </Card>
        </div>

        {/* Claim Rewards */}
        {pendingRewards > 0 && (
          <Card className="shadow-card mb-8 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Rewards Ready!</h3>
                  <p className="text-muted-foreground">
                    You have {pendingRewards.toFixed(2)} $AZK tokens ready to claim
                  </p>
                </div>
                <Button onClick={handleClaimRewards} className="glow-hover">
                  <Coins className="mr-2 h-4 w-4" />
                  Claim Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NFT Management */}
        <Tabs defaultValue="my-nfts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-nfts">My NFTs</TabsTrigger>
            <TabsTrigger value="staked">Staked NFTs</TabsTrigger>
          </TabsList>

          <TabsContent value="my-nfts" className="space-y-6">
            {/* Staking Configuration */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Staking Period</label>
                    <Select value={stakingPeriod} onValueChange={(value: StakingPeriod) => setStakingPeriod(value)}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STAKING_PERIODS).map(([key, period]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{period.label}</span>
                              <Badge variant="secondary">{period.multiplier}x</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {STAKING_PERIODS[stakingPeriod].multiplier}x reward multiplier, {STAKING_PERIODS[stakingPeriod].lockDays} day lock period
                    </p>
                  </div>
                  
                  {selectedNFTs.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {selectedNFTs.length} Selected
                        </div>
                      </div>
                      <Button onClick={handleStakeMultipleNFTs} className="glow-hover">
                        <Lock className="mr-2 h-4 w-4" />
                        Stake Selected ({selectedNFTs.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockNFTs.filter(nft => !nft.isStaked).map((nft) => {
                const isSelected = selectedNFTs.includes(nft.id);
                return (
                  <Card key={nft.id} className={`shadow-card overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                    <div className="aspect-square bg-gradient-secondary p-4 relative" onClick={() => toggleNFTSelection(nft.id)}>
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Checkbox 
                        checked={isSelected}
                        className="absolute top-2 left-2 bg-background"
                        onChange={() => toggleNFTSelection(nft.id)}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{nft.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getRarityColor(nft.rarity)}>
                          {nft.rarity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {nft.stakingPower} Power
                        </span>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleStakeNFT(nft.id)}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Stake NFT
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="staked" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockNFTs.filter(nft => nft.isStaked).map((nft) => {
                const daysStaked = nft.stakedAt 
                  ? Math.floor((Date.now() - nft.stakedAt.getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                const earnedRewards = nft.stakingPower * 0.1 * daysStaked;

                return (
                  <Card key={nft.id} className="shadow-card overflow-hidden border-primary/20">
                    <div className="aspect-square bg-gradient-secondary p-4 relative">
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary">
                        Staked
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{nft.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getRarityColor(nft.rarity)}>
                          {nft.rarity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {nft.stakingPower} Power
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Staked for:</span>
                          <span>{daysStaked} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Earned:</span>
                          <span className="text-accent">{earnedRewards.toFixed(2)} $AZK</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => handleUnstakeNFT(nft.id)}
                      >
                        <Unlock className="mr-2 h-4 w-4" />
                        Unstake NFT
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Staking;