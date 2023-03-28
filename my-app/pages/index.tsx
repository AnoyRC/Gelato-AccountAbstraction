import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import {
  GaslessOnboarding,
  GaslessWalletConfig,
  LoginConfig,
} from "@gelatonetwork/gasless-onboarding";
import { ethers } from "ethers";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { SafeEventEmitterProvider, UserInfo } from "@web3auth/base";
import { GaslessWallet } from "@gelatonetwork/gasless-wallet";
import QRCode from "qrcode";
import LandingWindow from "@/components/LandingWindow";
import SectionOne from "@/components/SectionOne";
import SectionTwo from "@/components/SectionTwo";
import SectionThree from "@/components/SectionThree";
import SectionFour from "@/components/SectionFour";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { gsap } from "gsap";
import LoadingProp from "@/components/LoadingScreen";

const inter = Inter({ subsets: ["latin"] });

const gaslessWalletConfig = {
  apiKey: process.env.NEXT_PUBLIC_ONEBALANCE_API_KEY,
};
const loginConfig = {
  domains: ["http://localhost:3000"],
  chain: {
    id: 5,
    rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
  },
  openLogin: {
    redirectUrl: "http://localhost:3000",
  },
};

export default function Home() {
  const [gaslessOnboarding, setGaslessOnboarding] =
    useState<GaslessOnboarding>();
  const [web3AuthProvider, setWeb3AuthProvider] =
    useState<SafeEventEmitterProvider>();
  const [gaslessWallet, setGaslessWallet] = useState<GaslessWallet>();
  const [address, setAddress] = useState("");
  const [userInfo, setUserInfo] = useState<Partial<UserInfo> | null>();
  const [qrCode, setQRCode] = useState<string | null>();
  const [isLoading, setIsLoading] = useState(false);
  const comp = useRef<HTMLDivElement>(null);

  const login = async () => {
    try {
      setIsLoading(true);

      const gaslessOnboarding = new GaslessOnboarding(
        loginConfig as LoginConfig,
        gaslessWalletConfig as GaslessWalletConfig
      );
      await gaslessOnboarding.init();

      const web3AuthProvider = await gaslessOnboarding.login();
      setWeb3AuthProvider(web3AuthProvider);
      setGaslessOnboarding(gaslessOnboarding);

      setIsLoading(false);

      const gaslessWallet = gaslessOnboarding.getGaslessWallet();
      setGaslessWallet(gaslessWallet);

      const address = gaslessWallet.getAddress();
      setAddress(address);
      console.log(address);
      generateQRCode(address);

      const userInfo = await gaslessOnboarding.getUserInfo();
      setUserInfo(userInfo);

      window.location.href = "/wallet";
    } catch (error) {
      console.log(error);

      setIsLoading(false);
    }
  };

  const generateQRCode = (address: string) => {
    QRCode.toDataURL(address).then((url: string) => setQRCode(url));
  };

  const logout = async () => {
    await gaslessOnboarding?.logout();

    setGaslessOnboarding(undefined);
    setWeb3AuthProvider(undefined);
    setGaslessWallet(undefined);
    setAddress("");
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      snap: {
        snapTo: 1 / 4,
        duration: 2,
      },
    });
  }, []);
  return (
    <div
      className="flex flex-col flex-nowrap h-fit w-[100vw] overflow-auto overflow-x-hidden"
      ref={comp}
    >
      <LandingWindow login={login} />
      <SectionOne />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
      <LoadingProp
        isLoading={isLoading}
        title="Signing In"
        desc="Processing sign in through Web3Auth"
        login={login}
        isLogin={true}
      />
    </div>
  );
}
