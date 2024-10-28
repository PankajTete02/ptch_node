export function randomstring(len: number): string {
	const arr = 'ABCDEFGHIJKLMNOPQRSTabcdefghijklmnopqrst1234567890-_!()';
	var retArr = [];
	for (var i = 0; i < len; i++) {
		retArr[i] = arr[Math.floor(Math.random() * arr.length)];
	}
	// console.log(retArr.join(''));
	return retArr.join('');
}