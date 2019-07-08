import { firstToUpper,copy} from '../util/util';

export default function (url) {
	return <div
		key={url.url}
		style={{ marginBottom: 5,cursor:'pointer' }}
		onClick={(e) => copy(e.currentTarget.innerText)}
		dangerouslySetInnerHTML={{
			__html: `
				/** ${url.summary} */ <br/>
				*${url.alias}({payload},{put,call}){ <br />
					&nbsp;&nbsp;&nbsp;&nbsp;
					const ${url.alias} = yield call(services.${url.alias},payload); <br />
					&nbsp;&nbsp;&nbsp;&nbsp;
					yield put({<br />
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						type:"update${firstToUpper(url.alias)}",<br />
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						${url.alias}<br />
						&nbsp;&nbsp;&nbsp;&nbsp;
					})<br />
				},
			`}}
	/>
}