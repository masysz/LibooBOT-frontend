import React from "react";
import { createBoard } from "@wixc3/react-board";
import Donate from "../../../pages/donate";

export default createBoard({
  name: "Donate",
  Board: () => <Donate />,
  isSnippet: true,
});
