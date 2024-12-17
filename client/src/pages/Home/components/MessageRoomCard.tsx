import { messageRoomType } from "../../../type/messageRoomType";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";
import { convertToUrlFriendly } from "../../../generic/convertToUrlFreiendly";
import { addRoomData } from "../../../lib/redux/slices/slice";
import { useDispatch } from "react-redux";
import { generateRandomAlphaNumeric } from "../../../utils/longAlphaNumericString";
import {
  ConversationsTypeArray,
  ConversationType,
} from "../../../type/dbConversationType";
import { Images } from "../../../../Images";
import { useUser } from "../../../customHooks/useUser";

type MessageRoomCard = {
  item: ConversationType;
};
export default function MessageRoomCard({ item }: MessageRoomCard) {
  const [isOpenGroupLinkDropDown, setIsOpenGroupLinkDropDown] = useState(false);

  const dispatch = useDispatch();
  const user = useUser();
  const findUserById = item.ConversationWithMember.find(
    (item) => item.user_id == user?.data?._id
  );

  console.log("");
  const handleCopyGroupLink = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    roomName: string
  ) => {
    e.stopPropagation();
    if (!window.navigator.clipboard) {
      return alert("Your browser does not support this");
    }
    await window.navigator.clipboard.writeText(
      `${
        import.meta.env.VITE_HOSTNAME
      }/${roomName}/invite/${generateRandomAlphaNumeric(20)}`
    );

    setIsOpenGroupLinkDropDown(false);
  };

  return (
    <motion.section
      onClick={() => {
        dispatch(addRoomData(item));
        // redirect(convertToUrlFriendly(`/${item.roomUniqueName}`));\
        window.location.href = convertToUrlFriendly(
          `/${item.conversation_name}`
        );
      }}
      className="flex gap-2 items-center hover:bg-slate-200 p-3 rounded-md cursor-pointer bg-green-50"
    >
      <img
        // src={item.avatar}
        src={Images.avatar_one_png}
        alt=" avatar"
        width={12}
        height={12}
        loading="lazy"
        className="sm:h-12 sm:w-12 w-8 h-8 rounded-full border border-black"
      />

      <div className="flex flex-col ">
        <div className="flex justify-between gap-4 items-center">
          <h5 className="font-semibold line-clamp-1">
            {item.conversation_name}
          </h5>
          <span className="text-green-500">5:47pm</span>
        </div>
      </div>
      <div className="ms-auto relative">
        {!findUserById && (
          <button className="px-2 bg-green-400 hover:bg-green-300 rounded-md">
            Join
          </button>
        )}

        {/* <BsThreeDots
          className="hover:bg-green-400 rounded-full p-1 text-xl"
          onClick={(e: any) => {
            e.stopPropagation();
            setIsOpenGroupLinkDropDown((prev) => !prev);
          }}
        /> */}
        {/* {isOpenGroupLinkDropDown && (
          <div
            onClick={(e) => handleCopyGroupLink(e, item.conversation_name)}
            className="absolute top-6 z-10 right-0 drop-shadow-md p-1 w-36 h-8 rounded-sm bg-gray-50"
          >
            Copy group link
          </div>
        )} */}
      </div>
    </motion.section>
  );
}
