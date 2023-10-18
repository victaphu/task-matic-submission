"use client"; // Wagmi is a client side component
import "./globals.css";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { localhost } from 'wagmi/chains';
//Configure the chain and the RPC provider. Note that we've added localhost here
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [localhost],
    [publicProvider()]
);

//Instantiate a wagmi config and pass the results of configureChains.
const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
});

// Create a WagmiConfig, pass config and wrap it around the children.
export default function Provider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
