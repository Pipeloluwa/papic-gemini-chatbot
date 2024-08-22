// npm install @google/generative-ai

import { LegacyRef, useEffect, useRef, useState } from 'react'
import { IoSend } from 'react-icons/io5'



import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  // Access your API key as an environment variable (see "Set up your API key" above)
  // const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const MODEL_API_KEY:string= import.meta.env.VITE_MODEL_API_KEY;
  const genAI = new GoogleGenerativeAI(MODEL_API_KEY);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
  const [modelChat] = useState(model.startChat());


  const divScrollRef:LegacyRef<HTMLDivElement> = useRef(null);

  const [userMessage, setUserMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages]= useState([
    {"chatbot": "Hey, how may I help you today?"},
    {"user": ''}
  ]);

  





  useEffect(() => {

    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');

        if (cookieName === "chatCookie") {
          const rawChatString= decodeURIComponent(cookieValue);
          const rawToJsonChat= JSON.parse(rawChatString);

          setMessages(rawToJsonChat);
        }

    }


  }, []);



  useEffect(() => {
    if (divScrollRef.current){
      divScrollRef.current.scrollTop= divScrollRef.current.scrollHeight;
    }

  }, [messages]);





  // +++++++++++++ SENDING MESSAGE ++++++++++++++++++
  const sendUserMessage= async() => {

    try {

      if (userMessage.trim() === ''){
        alert("Your message input is empty");
        return;
      }


      if (userMessage.trim() !== '') {
        // +++++++++ COPY THE message OBJECT AND ADD NEW ONE ++++++++
        const keepUserMessage= userMessage;
        let newUserMessage= messages.slice();
        newUserMessage.push({"user": userMessage});

        setMessages(newUserMessage);
        setUserMessage("");
        setIsProcessing(true);


        // +++++++++++++++++ TO SEND MESSAGE +++++++++++++++++
        // const result = await model.generateContent(keepUserMessage);

        // +++++++++++++++++ TO CHAT AND KEEP CONVERSATION +++++++++++++++++
        const chatResult= await modelChat.sendMessage(keepUserMessage);
        const response = await chatResult.response;
        const text = response.text();
        
        newUserMessage= newUserMessage.slice();
        newUserMessage.push({"chatbot": text});

        setMessages(newUserMessage);

        setIsProcessing(false);


        // +++++++++++++= IF YOU WISH TO DELETE THE COOKIE +++++++++++++++
        // const expirationDate = new Date(0); // Set expiration date to the past
        // document.cookie = `chatCookie=; expires=${expirationDate.toUTCString()}; path=/`;

        // STORING THE WHOLE CONVERSATION IN COOKIE FOR 7000 DAYS, YOU HAVE TO ATTACH A DATABASE TO IT TO KEEP ALIVE THE COOKIE
        const days= 7000;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
  
        const cookieValue = encodeURIComponent(JSON.stringify(newUserMessage)) + (days ? `; expires=${expirationDate.toUTCString()}` : '');
        document.cookie = `${"chatCookie"}=${cookieValue}; path=/`;
      }


    } catch (error) {
      alert("Something went wrong, please try again");
      setIsProcessing(false);
      return;
    }

  }




  



  return (
    <>

      <div className='relative overflow-hidden h-screen mx-auto sm:p-6 '>

        <div className='xl:mx-[25%] lg:mx-[15%] sm:mx-[5%] bg-gradient-to-b from-[#1565af] to-[#00182e] absolute left-0 right-0 top-[10px] bottom-[10px] rounded-2xl' />

        <div ref={divScrollRef} className='absolute left-0 right-0 top-[13px] bottom-[25px] pt-6 pb-8 flex flex-col xl:px-[30%] lg:px-[20%] sm:px-[10%] px-[4%] sm:h-[85%] h-[90%] gap-y-4 overflow-hidden overflow-y-scroll scroll-smooth '>
          {
            messages.map(
              (item, index) => {
                  
                    if (item.chatbot && item.chatbot !== ''){
                      return (
                        <div key={`chatbot ${index}`} className='flex flex-col gap-y-2 items-start'>
                          <h1 className='flex justify-start text-[#F0F8FF] pl-2 font-bold'>
                            Assistant Bot
                          </h1>

                          <h1 className='text-black flex justify-start bg-[#F0F8FF] min-h-[50px] md:max-w-[500px] max-w-[280px] rounded-2xl p-4'>
                            {item.chatbot}
                          </h1>
                        </div>
                      );

                    }

                    else if (item.user && item.user !== ''){
                      return (
                        <div key={`user ${index}`} className='flex flex-col gap-y-2 items-end'>
                          <h1 className='flex justify-end text-[#d8f3ff] pl-2 font-bold'>
                            User
                          </h1>

                          <h1 className='text-black flex justify-end bg-[#89CFF0] min-h-[50px] md:max-w-[500px] max-w-[280px] rounded-2xl p-4'>
                            {item.user}
                          </h1>
                        </div>  
                      );

                    }

                  
              }) 
          }



          {
            isProcessing
            ? <div className='dots ml-8 pt-[13.4px] mt-2' />

            : ""
          }
          

        </div>




        <div className='absolute left-0 right-0 bottom-[25px] flex h-[10%] xl:mx-[30%] lg:mx-[20%] sm:mx-[10%] mx-[4%] items-end justify-center gap-x-4'>
          <textarea placeholder='Type Here...' value={userMessage} onChange={(e) => setUserMessage(e.target.value)} rows={1} name="" id="" className='w-full resize-none p-4 rounded-2xl overflow-clip shadow-sm shadow-black outline-none'>

          </textarea>

          <button onClick={sendUserMessage} className={`${userMessage.trim() === '' ? 'pointer-events-none bg-gray-300/75 hover:bg-none': 'cursor-pointer'} hover:bg-gray-200 bg-white p-4 rounded-full shadow-sm shadow-black`}>
            <IoSend className='cursor-pointer size-[30px] text-[#007FFF]'/>
          </button>

        </div>

      </div>
      
        
    </>
  )
}

export default App
