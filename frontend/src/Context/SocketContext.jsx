import React, { createContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { socketIoUrl } from "../socketioUrl";

export const socket = io.connect(socketIoUrl, { forceNew: true });
export const SocketContext = createContext();

// export const SocketProvider = (props) => {
//   let socket = io.connect(socketIoUrl);
//   //   useEffect(() => {
//   //     socket = io.connect(socketIoUrl);
//   //   }, []);

//   return (
//     <SocketContext.Provider value={{ socket }}>
//       {props.children}
//     </SocketContext.Provider>
//   );
// };
