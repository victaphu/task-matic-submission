"use client"
// components/UserScreen.js

import React, { useState, useEffect } from 'react';
import CreateTaskForm from './createTaskForm';
import { useAccount, useConnect, useNetwork, useSwitchNetwork, useBalance } from 'wagmi';





// import { useEthers, useEtherBalance } from '@wagmi/eth-hooks';
// import TaskList from './TaskList';
// import CreateTaskForm from './CreateTaskForm';
// import Dashboard from './Dashboard';

function UserScreen() {
  // const { account, chainId } = useEthers();
  // const etherBalance = useEtherBalance(account);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [squarePaymentLink, setSquarePaymentLink] = useState('');

  const { address, connector: activeConnector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();

  const balance = useBalance({
    address,
    token: "0x7581a34d18B3c31f2f8101EF223E96350c1000dF"
  });

  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: 1337
  });

  console.log(balance?.data?.value)

  useEffect(() => {
    if (!address || chain?.id != 1337) {
      console.log("invalid", address, chain);
      return;
    }
  }, [chain, address])

  useEffect(() => {
    if (!address) {
      return;
    }
    // Fetch Square payment link here and set it in 'squarePaymentLink'
    const fetchSquarePaymentLink = async () => {
      try {
        const response = await fetch('/api/paymentlink?address=' + address); // Replace with your API endpoint
        if (response.ok) {
          const link = await response.json();
          setSquarePaymentLink(link.payment_link.long_url);
        } else {
          console.error('Failed to fetch Square payment link');
        }
      } catch (error) {
        console.error('Error fetching Square payment link:', error);
      }
    };

    fetchSquarePaymentLink();
  }, [address]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <aside className="w-1/5 p-4 bg-gray-800">
        <div className="mb-6">
          <button
            className={`block w-full p-2 text-left rounded focus:outline-none ${showDashboard ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            onClick={() => {
              setShowDashboard(true);
              setShowCreateTask(false);
            }}
          >
            Dashboard
          </button>
        </div>
        <div className="mb-6">
          <button
            className={`block w-full p-2 text-left rounded focus:outline-none ${showCreateTask ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            onClick={() => {
              setShowCreateTask(true);
              setShowDashboard(false);
            }}
          >
            Create New Task
          </button>
        </div>
        <div className="mb-6">
          <a href="/"
            className={`block w-full p-2 text-left rounded focus:outline-none`}
            onClick={() => {
              setShowCreateTask(true);
              setShowDashboard(false);
            }}
          >
            Home
          </a>
        </div>
        {/* Show the list of submitted tasks here */}
        {/* <TaskList /> */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Welcome to Taskmatic</h1>
          <div className="flex justify-between">
            <p>Manage your tasks with ease.</p>
            <div>
              <p>TSM Balance: {balance.data?.value.toString()} TSM</p>
              <button
                className="text-blue-500 hover:underline"
                onClick={async () => {
                  console.log(squarePaymentLink);
                  window.open(squarePaymentLink, '_blank')
                  const res = await fetch('/api/purchasetoken?address=' + address);
                  console.log("Complete?", await res.json());
                  
                }}
              >
                Purchase Tokens
              </button>
            </div>
          </div>
        </div>

        {/* {showDashboard && (
          <Dashboard />
        )}*/}

        {showCreateTask && (
          <CreateTaskForm createTask={""} />
        )}
      </main>
    </div>
  );
}

export default UserScreen;
