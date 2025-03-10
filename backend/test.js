const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');

// Configuration from environment variables
const ENDPOINTS = [
    {
        name: 'Production',
        api: 'https://email-api.thisisparadox.com',
        mongodb: 'mongodb://backend-mongodb-1:27017'
    }
];

async function testEndpoint(url) {
    console.log(`Testing API endpoint: ${url}`);
    try {
        const response = await fetch(`${url}/test`);
        const data = await response.json();
        console.log('API Response:', data);
        return true;
    } catch (error) {
        console.error('API Test Error:', error.message);
        return false;
    }
}

async function testMongoDB(url) {
    console.log(`Testing MongoDB connection: ${url}`);
    try {
        const client = await MongoClient.connect(url);
        console.log('MongoDB Connection Successful');
        await client.close();
        return true;
    } catch (error) {
        console.error('MongoDB Test Error:', error.message);
        return false;
    }
}

async function testConfiguration(config) {
    console.log(`\nTesting ${config.name} Configuration:`);
    console.log('-------------------------');
    
    const apiSuccess = await testEndpoint(config.api);
    const mongoSuccess = await testMongoDB(config.mongodb);
    
    return {
        name: config.name,
        api: apiSuccess,
        mongodb: mongoSuccess
    };
}

async function runTests() {
    console.log('Starting Configuration Tests\n');
    
    const results = [];
    for (const config of ENDPOINTS) {
        const result = await testConfiguration(config);
        results.push(result);
    }
    
    console.log('\nTest Results Summary:');
    console.log('-------------------');
    results.forEach(result => {
        console.log(`\n${result.name}:`);
        console.log(`API Test: ${result.api ? '✅ Passed' : '❌ Failed'}`);
        console.log(`MongoDB Test: ${result.mongodb ? '✅ Passed' : '❌ Failed'}`);
    });
}

runTests().catch(console.error);
