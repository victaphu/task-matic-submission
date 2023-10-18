"use client"
import { ethers } from 'ethers';
// components/CreateTaskForm.js

import React, { useState } from 'react';
import { erc20ABI, useAccount, useContractEvent, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import EventLog from './eventlog';
import taskmanager from "./taskmanager.json";

function CreateTaskForm() {
  const [agentCount, setAgentCount] = useState(1);
  const [verifierCount, setVerifierCount] = useState(1);
  const [agentFee, setAgentFee] = useState(0);
  const [verifierFee, setVerifierFee] = useState(0);
  const [prompt, setPrompt] = useState('');
  const { address, connector: activeConnector, isConnected } = useAccount();
  const [eventLog, setEventLog] = useState<any>([]);

  const { config } = usePrepareContractWrite({
    address: '0x68134c2D0138Cd2E811d275062e88BaE35A9fcA6',
    abi: taskmanager.abi,
    functionName: 'createTask',
    args: [verifierFee, agentFee, agentCount, verifierCount, prompt]
  });
  
  const { data, isLoading, isSuccess, writeAsync } = useContractWrite(config);

  const approvecfg = usePrepareContractWrite({
    address: '0x7581a34d18B3c31f2f8101EF223E96350c1000dF',
    abi: erc20ABI,
    functionName: 'approve',
    args: ["0x68134c2D0138Cd2E811d275062e88BaE35A9fcA6", ethers.parseUnits((verifierFee + agentFee) + "", 10)]
  });

  useContractEvent({
    address: '0x68134c2D0138Cd2E811d275062e88BaE35A9fcA6',
    abi: taskmanager.abi,
    eventName: 'TaskSubmitted',
    listener(log: any) {
      setEventLog((prev: any) => {
        prev.push({
          taskId: log?.[0].args.taskId.toString(),
          title: "Task Submitted",
          description: `Task with id ${log?.[0].args.taskId.toString()} submitted successfully`
        })
        return [...prev];
      })
    },
  });

  useContractEvent({
    address: '0x68134c2D0138Cd2E811d275062e88BaE35A9fcA6',
    abi: taskmanager.abi,
    eventName: 'VerifierAccepted',
    listener(log: any) {
      setEventLog((prev: any) => {
        prev.push({
          taskId: log?.[0].args.taskId.toString(),
          title: "Verifier Accepted Task",
          description: `Task with id ${log?.[0].args.taskId.toString()} accepted by verifier ${log?.[0].args.verifierId?.toString()}`
        })
        return [...prev];
      })
    },
  });
  useContractEvent({
    address: '0x68134c2D0138Cd2E811d275062e88BaE35A9fcA6',
    abi: taskmanager.abi,
    eventName: 'AgentAccepted',
    listener(log: any) {
      setEventLog((prev: any) => {
        prev.push({
          taskId: log?.[0].args.taskId.toString(),
          title: "Agent Accepted",
          description: `Task with id ${log?.[0].args.taskId.toString()} accepted by agent ${log?.[0].args.agentId.toString()}`
        })
        return [...prev];
      })
    },
  });

  useContractEvent({
    address: '0x68134c2D0138Cd2E811d275062e88BaE35A9fcA6',
    abi: taskmanager.abi,
    eventName: 'TaskVerifying',
    listener(log: any) {
      setEventLog((prev: any) => {
        prev.push({
          taskId: log?.[0].args.taskId.toString(),
          title: "Task completed, verifying",
          description: `Task with id ${log?.[0].args.taskId.toString()} completed processing and now verifying`
        })
        return [...prev];
      })
    },
  });

  useContractEvent({
    address: '0x68134c2D0138Cd2E811d275062e88BaE35A9fcA6',
    abi: taskmanager.abi,
    eventName: 'TaskCompleted',
    listener(log: any) {
      async function p() {
        const res = await fetch('/api/taskresult?taskId=' + log?.[0].args.taskId.toString());
        const json = await res.json();

        setEventLog((prev: any) => {
          prev.push({
            taskId: log?.[0].args.taskId.toString(),
            title: "Task completed and verified!",
            description: `Task with id ${log?.[0].args.taskId.toString()} completed. Result is ${json.responseData}`
          })
          return [...prev];
        })
      };
      p();
    },
  })

  const approve = useContractWrite(approvecfg.config);

  console.log(eventLog);
  const handleCreateTask = async () => {
    // Ensure agentCount, verifierCount, agentFee, and verifierFee are properly formatted
    const formattedAgentCount = parseInt(""+agentCount, 10);
    const formattedVerifierCount = parseInt(""+verifierCount, 10);
    const formattedAgentFee = parseFloat(""+agentFee);
    const formattedVerifierFee = parseFloat(""+verifierFee);

    if (isNaN(formattedAgentCount) || isNaN(formattedVerifierCount) || isNaN(formattedAgentFee) || isNaN(formattedVerifierFee) || formattedAgentCount < 1 || formattedVerifierCount < 1 || formattedAgentFee < 0 || formattedVerifierFee < 0) {
      alert('Invalid input values. Please check your inputs.');
      return;
    }

    await approve.writeAsync?.();
    console.log("Approved!");
    // Call the createTask function with the provided parameters
    await writeAsync?.();
    console.log("Task submitted!");
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
      <h2 className="text-2xl font-semibold mb-4">Create New Task</h2>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm">Agents</label>
            <select
              className="bg-gray-700 border rounded p-2 w-full"
              value={agentCount}
              onChange={(e) => setAgentCount(+e.target.value)}
            >
              <option value={1}>1</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className="block text-sm">Verifiers</label>
            <select
              className="bg-gray-700 border rounded p-2 w-full"
              value={verifierCount}
              onChange={(e) => setVerifierCount(+e.target.value)}
            >
              <option value={1}>1</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm">Agent Fee (TSM)</label>
            <input
              type="number"
              className="bg-gray-700 border rounded p-2 w-full"
              value={agentFee}
              onChange={(e) => setAgentFee(+e.target.value)}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm">Verifier Fee (TSM)</label>
            <input
              type="number"
              className="bg-gray-700 border rounded p-2 w-full"
              value={verifierFee}
              onChange={(e) => setVerifierFee(+e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm">Prompt (max 300 characters)</label>
          <textarea
            className="bg-gray-700 border rounded p-2 w-full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={300}
          />
        </div>
        <button
          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
          onClick={handleCreateTask}
        >
          Create Task
        </button>
      </div>
      <EventLog events={eventLog} />
    </div>
  );
}

export default CreateTaskForm;
