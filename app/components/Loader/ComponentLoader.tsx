import { CSSProperties, FunctionComponent, ReactElement } from 'react';
import styles from './Loader.module.scss';

interface ComponentLoaderProps {
    className?: string;
}

const ComponentLoader: FunctionComponent<ComponentLoaderProps> = ({ className: classNamw }): ReactElement => {

    return (
        <div className={`w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin ${classNamw}`} />
    );
}

export default ComponentLoader;