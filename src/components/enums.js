/*
 * @Author: yueHui
 * @Date: 2020-01-02 15:57:36
 * @Last Modified by: yueHui
 * @Last Modified time: 2020-01-02 16:51:09
 */

import styles from './styles.less';

function Enums(props){
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
