export default function (url) {
	return <div
		key={url.url}
		style={{ marginBottom: 5 }}
		dangerouslySetInnerHTML={{
			__html: `
				/** ${url.summary} */ <br/>
				*getExerciseTypes({payload},{put,call}){ <br />
					&nbsp;&nbsp;&nbsp;&nbsp;
					const exerciseTypes = yield call(services.getExerciseTypes,payload); <br />
					&nbsp;&nbsp;&nbsp;&nbsp;
					yield put({<br />
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						type:"updateExerciseTypes",<br />
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						exerciseTypes<br />
						&nbsp;&nbsp;&nbsp;&nbsp;
					})<br />
				},
			`}}
	/>
}