import { FormControl } from "@chakra-ui/form-control";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast ,Flex, Progress, Icon, Tooltip} from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import React from "react";
import { FaArrowRight,FaSortDown } from 'react-icons/fa';

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:3001"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;
const colors = ['green','blue','yellow','orange','red'];
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isClassifying,setisClassifying] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  // const [barValue, setBarValue] = useState(0);
  const [messageClass,setMessageClass] = useState(0);
  const [isMessageToxic,setIsMessageToxic] = useState(0);
  const [isError,setMessageError] = useState(false);
  // const [searchTerm, setSearchTerm] = useState('')

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(async () => {
  //     console.log(searchTerm)
  //     // Send Axios request here
  //     if(newMessage.length > 0 && isClassifying == false) {
  //       // await classifyMessage()
  //       const newPosition= Math.min((parseInt(messageClass))-1, colors.length - 1);
  //       // setBarValue(newPosition);
  //     }
  //     // const newPosition = Math.min((parseInt(e.target.value.length)-1), colors.length - 1);
  //   },500 )

  //   return () => clearTimeout(delayDebounceFn)
  // }, [searchTerm])

  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  // const classifyMessage = async () => {
  //   const toxicClasses = ['obscene', 'threat', 'insult', 'identity-hate','severe-toxic']

  //   try {
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     };

  //     setLoading(true);
  //     setisClassifying(true)
  //     console.log("---",loading)

  //     const { data } = await axios.post(
  //       `/api/classify/`,{message: newMessage},
  //       config
  //     );
  //     // setMessages(data);
  //     // let toxicClass = data.class.split("\n")[1]
  //     // console.log("Message Class", toxicClass);
  //     // console.log(toxicClasses.indexOf(data.class.split(" ")[1].split("\r")[0]))
  //     // console.log(parseFloat(data.class.split(" ")[0]))
  //     // console.log(data.class.includes('severe-toxic'))
  //     let isToxic = parseFloat(data.class.split(" ")[0])
  //     if(isToxic > 0.5){
  //       if(data.class.includes('severe-toxic')){
  //         setMessageError(true)
  //         setIsMessageToxic(true)
  //       }
  //       if(isToxic > 0.8){
  //         setMessageError(true)
  //         setIsMessageToxic(true)
  //       }
  //       setMessageClass(toxicClasses.indexOf(data.class.split(" ")[1].split("\r")[0]))
  //     }
  //     else{
  //       setMessageError(false)
  //       setIsMessageToxic(false)
  //       setMessageClass(0)
  //     }

  //       // return toxicClass
  //     setisClassifying(false)
  //     setLoading(false);

  //   } catch (error) {
  //     console.log(error);
  //     toast({
  //       title: "Error Occured!",
  //       description: "Failed to Classify the Messages",
  //       status: "error",
  //       duration: 6000,
  //       isClosable: true,
  //       position: "bottom",
  //     });
  //   }
  // };

  const handleSearch = async () => {
    try {
      console.log("HERE")

    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured!",
        description: "Failed to Classify the Messages",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
    
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            toxicClass: isMessageToxic ? 0 : messageClass,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const CustomProgressBar = ({value}) => {
    const colors = ['blue.400', 'teal.400', 'yellow.400', 'orange.400', 'red.400']
    const toxicClasses = ['obscene', 'threat', 'insult', 'identity-hate','severe-toxic']
    const classification = messageClass
    console.log("Classification ---- ",classification)
    const arrowPosition = classification
    return (
      <div>
        <Flex position="relative">
          {colors.map((color, index) => (
            <Tooltip label={toxicClasses[index]} placement="top">
            <Box
              key={index}
              flex="1"
              height="20px"
              bg={color}
              borderTopLeftRadius={index === 0 ? 'md' : '0'}
              borderBottomLeftRadius={index === 0 ? 'md' : '0'}
              borderTopRightRadius={index === colors.length - 1 ? 'md' : '0'}
              borderBottomRightRadius={index === colors.length - 1 ? 'md' : '0'}
              marginLeft={index <= colors.length - 1 ? '2px' : '0'}
              marginBottom="10px"
            />
          </Tooltip>
          ))}
            <Icon
              as={FaSortDown}
              color="Black"
              position="absolute"
              top="-20px"
              left={`${(100 / colors.length) * arrowPosition}%`}
              transform="translateX(-50%)"
            />
        </Flex>
      </div>
    );
  };
  
  
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = async (e) => {
    // setBarValue(0);
    setMessageError(false)
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    // let lastTypingTime = new Date().getTime();
    // var timerLength = 3000;
    // setTimeout(() => {
    //   var timeNow = new Date().getTime();
    //   var timeDiff = timeNow - lastTypingTime;
    //   if (timeDiff >= timerLength && typing) {
    //     socket.emit("stop typing", selectedChat._id);
    //     setTyping(false);
    //   }
    // }, timerLength);
    // const newValue = parseInt(e.target.value.length)-1;
    // const newValue =  Math.floor(Math.random() * (5 - 1 + 1) + 1)
    // console.log(newValue,colors[newValue]);
    // const newPosition = Math.min((parseInt(e.target.value.length)-1), colors.length - 1);
    
    // setArrowPosition(newPosition);

    // await classifyMessage()
    // const newPosition = Math.min((parseInt(messageClass)-1), colors.length - 1);
    // setBarValue(newPosition);

    // setSearchTerm(e.target.value)
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            {/* {loading ? 
              (isClassifying ? 
                (
                  <Box>
                    <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" /> 
                    <Text fontSize='2xl'>Classigying your message</Text>
                  </Box>
                ) : 
                (
                  <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" /> 
                )
              ) : 
              (
                <div className="messages"> 
                  <ScrollableChat messages={messages} /> 
                </div> 
              )
            } */}

            <FormControl
              // onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              {/* <ProgressBar value={barValue} /> */}
              {/* {isClassifying ? (<Text textAlign="center" fontSize='2xl'>Classifying your message</Text>) : (<CustomProgressBar value={barValue} />)} */}
              <Flex justify="space-between">
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  borderColor={isError ? 'red.500' : '#E0E0E0'}
                  borderWidth={isError ? '2px' : '0px'}
                />
                <Tooltip label="Not Allowed to send message classified as Severe Toxic" isOpen={isError} placement="top">
                  <Button isDisabled={isError || isClassifying} onClick={sendMessage}> Send </Button>
                </Tooltip>
              </Flex>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
