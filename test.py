from google import genai

client = genai.Client(api_key="")

content = "Give me a feedback of my understanding regarding neural network. Neural network consist of input layer, hidden layers and output layer. On each hidden layer they have their own weight and bias, which will affect the output. The correctness of the network depends on the loss function, where it will then be feedback onto the network again until the output makes the correct decision based on the repeated training"

response = client.models.generate_content(
    model="gemini-1.5-flash", contents=content
)
print(response.text)