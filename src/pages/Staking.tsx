import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Lock, Unlock, Trophy, Zap } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

const Staking = () => {
  const { address, isConnected } = useAccount();
  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);
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

  const handleStakeNFT = async (nftId: number) => {
    try {
      // Mock staking transaction
      toast({
        title: "Staking NFT",
        description: "Transaction submitted to Monad blockchain...",
      });
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "NFT Staked Successfully!",
        description: "Your NFT is now earning $AZK rewards.",
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockNFTs.filter(nft => !nft.isStaked).map((nft) => (
                <Card key={nft.id} className="shadow-card overflow-hidden">
                  <div className="aspect-square bg-gradient-secondary p-4">
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover rounded-lg"
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
              ))}
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
    </div>
  );
};

export default Staking;