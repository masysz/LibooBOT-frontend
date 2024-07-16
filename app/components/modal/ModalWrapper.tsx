import { modalCardVariant, modalOverlayVariant } from "@/app/animations/modal"
import { motion } from "framer-motion"
import React, { Dispatch, ReactNode, SetStateAction } from 'react'

type Props = {
    /**
     * The function to set the visibility state of the modal
     */
    setVisibility: Dispatch<SetStateAction<boolean>>

    /**
     * The visibility state of the modal
     */
    visibility: boolean

    /**
     * The content of the modal
     */
    children: ReactNode

    /**
   * 
      The disallowOverlayFunction prop (optional prop) if specified, makes sure the overlay does not close the modal when clicked upon
   */
    disallowOverlayFunction?: boolean
}

const ModalWrapper = ({ visibility, setVisibility, children, disallowOverlayFunction }: Props) => {
    return (
        <motion.div
            initial="closed"
            animate={visibility ? "opened" : "closed"}
            className={`fixed w-full h-full top-0 left-0 z-30 flex items-center justify-center ${!visibility && 'pointer-events-none'}`}>

            <motion.div
                variants={modalOverlayVariant}
                className="absolute w-full h-full top-0 left-0 bg-gray-800 bg-opacity-50 z-30"
                onClick={() => disallowOverlayFunction ? {} : setVisibility(false)} />

            <motion.div variants={modalCardVariant} className="z-50">
                {children}
            </motion.div>
        </motion.div>
    )
}

export default ModalWrapper