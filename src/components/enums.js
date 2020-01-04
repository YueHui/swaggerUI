/*
 * @Author: yueHui
 * @Date: 2020-01-02 15:57:36
 * @Last Modified by: yueHui
 * @Last Modified time: 2020-01-04 15:36:31
 */

import {useEffect} from 'react';
import { remote, ipcRenderer } from 'electron';
import { FindInPage } from 'electron-find';
import styles from './styles.less';

function Enums(props){
    useEffect(()=>{
        let findInPage = new FindInPage(remote.getCurrentWebContents(), {
            preload: true
        })
        findInPage.openFindWindow()

        ipcRenderer.on('on-find', (e, args) => {
            // eslint-disable-next-line no-unused-expressions
            findInPage ? findInPage.openFindWindow() : ''
        })
        return ()=>{
            findInPage.destroy()
        }
    },[]);

    return <div className={styles.enums}>
        {props.data.map((enu,index)=>{
            return <div key={enu.structName+index}>
                {enu.description}:
                <ul>
                    {enu.enum.map(e=>{
                        return <li key={e}>{e}</li>
                    })}
                </ul>
            </div>
        })}
    </div>
}

export default Enums;
