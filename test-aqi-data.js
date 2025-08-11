// Test script to verify AQI data generation for different time ranges
const { fetchEnvironmentalData } = require('./src/services/aqi.ts');

async function testAqiData() {
  try {
    console.log('Testing AQI data generation...');
    
    const envData = await fetchEnvironmentalData('mumbai');
    
    console.log('\n=== DAILY DATA ===');
    console.log('Count:', envData.timeRangeAverages.daily.length);
    console.log('Sample:', envData.timeRangeAverages.daily.slice(0, 3));
    
    console.log('\n=== WEEKLY DATA ===');
    console.log('Count:', envData.timeRangeAverages.weekly.length);
    console.log('Sample:', envData.timeRangeAverages.weekly);
    
    console.log('\n=== MONTHLY DATA ===');
    console.log('Count:', envData.timeRangeAverages.monthly.length);
    console.log('Sample:', envData.timeRangeAverages.monthly.slice(0, 3));
    
    console.log('\n=== YEARLY DATA ===');
    console.log('Count:', envData.timeRangeAverages.yearly.length);
    console.log('Sample:', envData.timeRangeAverages.yearly);
    
  } catch (error) {
    console.error('Error testing AQI data:', error);
  }
}

testAqiData();
