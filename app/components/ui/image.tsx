import Image, { ImageProps } from 'next/image'
import React from 'react'

type Props = ImageProps & {}

const CustomImage = (props: Props) => {
    return (
        <Image {...props} sizes='auto' fill />
    )
}

export default CustomImage