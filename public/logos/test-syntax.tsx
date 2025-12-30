// Test file to isolate syntax issue
const testFunction = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('Stream obtained:', stream);
  } catch (error) {
    console.error('Error:', error);
  }
};

export default testFunction;