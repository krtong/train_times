let db = firebase.firestore();
let trains = [];

async function getTrainTimes() {
    const snapshot = await db.collection('trains').get();
    return snapshot.docs.map(doc => ({
        __id: doc.id,
        ...doc.data()
    }));
};

async function queryFirestore() {
    const posts = await getTrainTimes();
    trains = posts;

    const html = await posts.map((train, idx) => {
        const nowUnix = moment().unix() 
        const name = train['train name'];
        const destination = train['destination'];
        const frequency = `${train['frequency']} minutes`
        const firstTrainUnix = moment(train['first train time'], 'HH:mm').unix();
        const firstTrainTime = moment(train['first train time'], 'HH:mm').format('hh:mm a')

        let nextTrainDuration;
        let nextTrainTime;

        //if current time is before the first Train of the day:
        if (firstTrainUnix > nowUnix) {

            nextTrainDuration = moment.duration(firstTrainUnix - nowUnix, 's').humanize();
            nextTrainTime = firstTrainTime;

            //if current time is after the first Train of the day:
        } else {

            let seconds = (nowUnix - firstTrainUnix) % (train['frequency'] * 60);
            nextTrainDuration = moment.duration(seconds, 's').humanize();
            nextTrainTime = moment.unix(nowUnix + seconds).format('hh:mm a');

        };
        return `<tr>
                    <th scope="row">${idx + 1}</th>
                    <td>${name}</td>
                    <td>${destination}</td>
                    <td>${frequency}</td>
                    <td>${nextTrainTime}</td>
                    <td>${nextTrainDuration}</td>
                </tr>`;
    }).join('');
    $("#table").html(html)
};

queryFirestore();


$(document).on("click", "#submit", function () {
    event.preventDefault();
    let addDoc = db.collection('trains').add({
        'train name': $("#name-input").val().trim(),
        'destination': $("#destination-input").val().trim(),
        'first train time': $("#train-time-input").val().trim(),
        'frequency': $("#frequency-input").val().trim(),
    }).then(ref => {
        console.log('Added document with ID: ', ref.id);
    });

    queryFirestore();
});