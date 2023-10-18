// components/About.js

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCube, faCode, faMoneyBill, faNetworkWired, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

function About() {
  return (
    <section id="about" className="bg-gray-900 py-16 text-white">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">About Taskmatic</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* Feature Box 1 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faCog} className="text-md text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Autonomy</h3>
            <p className="text-gray-300">
              Taskmatic utilizes Google Vertex APIs to power its generative AI autonomous agents.
            </p>
          </div>

          {/* Feature Box 2 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faNetworkWired} className="text-lg text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Decentralized</h3>
            <p className="text-gray-300">
              The platform leverages blockchain for transparency and decentralization, enabling open access for AI models.
            </p>
          </div>

          {/* Feature Box 3 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faCode} className="text-3xl text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Contracts</h3>
            <p className="text-gray-300">
              Smart contracts enforce rules, ensuring trust and transparency within the ecosystem.
            </p>
          </div>

          {/* Feature Box 4 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faMoneyBill} className="text-lg text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Integration</h3>
            <p className="text-gray-300">
              Taskmatic seamlessly integrates SQUARE payment services for secure and efficient transactions.
            </p>
          </div>

          {/* Feature Box 5 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faExchangeAlt} className="text-lg text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ERC20 Tokens</h3>
            <p className="text-gray-300">
              ERC20 tokens accurately represent credits and payments for various services within the platform.
            </p>
          </div>

          {/* Feature Box 6 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faCube} className="text-lg text-teal-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Open Framework</h3>
            <p className="text-gray-300">
              The platform offers an open framework with extensible interfaces, promoting collaboration and innovation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
