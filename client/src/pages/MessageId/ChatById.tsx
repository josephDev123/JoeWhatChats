import { useParams } from "react-router-dom";
import { Images } from "../../../Images";
import IncomingMessage from "../../components/messageId/IncomingMessage";
import SentMessage from "../../components/messageId/SentMessage";
import { GrEmoji } from "react-icons/gr";
import { GrFormAttachment } from "react-icons/gr";
import UploadFilePopUp from "../../components/messageId/UploadFilePopUp";
import { useState } from "react";

export default function ChatById() {
  const [toggleAttachment, setToggleAttachment] = useState(false);
  const { id } = useParams();
  return (
    <section className="flex flex-col w-full h-full">
      <div className="flex gap-2 items-center py-2 px-4 bg-black/40">
        <div className="w-12 h-12 rounded-full hover:">
          <img src={Images.avatar_one_png} alt="" />
        </div>
        <div className="flex flex-col leading-tight text-white/80">
          <h5 className="font-bold ">{id}</h5>
          <p>breteke, garri, juwon, mercy, joshua</p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 px-4 text-white/80 pt-8">
        <IncomingMessage />
        <SentMessage />
      </div>
      <div className="relative text-white/80 flex gap-4 mt-auto items-center py-2 px-4 bg-black/40">
        <GrEmoji className="hover:bg-black/30 p-1 rounded-md text-3xl cursor-pointer" />
        <GrFormAttachment
          onClick={() => setToggleAttachment((prev) => !prev)}
          className="hover:bg-black/30 p-1 rounded-md text-3xl cursor-pointer"
        />
        <input
          type="text"
          placeholder="Type a message"
          className="bg-transparent w-full focus:outline-none"
        />
      </div>

      {toggleAttachment && <UploadFilePopUp />}
    </section>
  );
}