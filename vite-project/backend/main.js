import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function messify(code) {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite"});

    const prompt = `You are a chaotic code transformer. Rewrite the following code.
Rules:
- Do NOT change what the code does or its output.
- Rename variables/functions to absurd, silly names.
- Add pointless but harmless indirection (e.g. wrap simple values in unnecessary functions).
- Use inconsistent formatting and weird comments.
- Return ONLY the transformed code inside a single code block, no explanation.

Original code:
${code}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(text);
}

const code = `#include <stdio.h>

void swap(int *arr, int i, int j)
{
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

void bubbleSort(int arr[], int n)
{
    for (int i = 0; i < n - 1; i++)
    {

        // Last i elements are already in place, so the loop will only num n - i - 1 times
        for (int j = 0; j < n - i - 1; j++)
        {
            if (arr[j] > arr[j + 1])
                swap(arr, j, j + 1);
        }
    }
}

int main()
{
    int arr[] = {5, 6, 1, 3};
    int n = sizeof(arr) / sizeof(arr[0]);

    // Calling bubble sort on array arr
    bubbleSort(arr, n);

    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    return 0;
}`


messify(code);