const aws = require('aws-sdk')

// Configure AWS authentication
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || awsAccessKeyId,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || awsSecretAccessKey
})
const s3 = new aws.S3()

function savePdfToAWS(templeCardDto, callback) {
    var params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: templeCardDto.key,
        Body: templeCardDto.value,
        ContentType: 'application/pdf'
    }

    s3.upload(params, (error, data) => {
        if (error) {
            console.log(error)
            callback(error)
        }

        callback(undefined)
    })
}

function loadPdfFromAWS(fsId, callback) {
    if (fsId == undefined) {
        callback('FSID is undefined');
        return;
    }
    var params = {
        Bucket: process.env.S3_BUCKET_NAME, 
        Key: `${fsId}.pdf`
    };

    console.log('params.Key', params.Key);

    s3.getObject(params, (error, data) => {
        if (error) {
            callback(error)
        } else {
            callback(undefined, data.Body)
        }
    })
}

module.exports = {
    savePdfToAWS: savePdfToAWS,
    loadPdfFromAWS: loadPdfFromAWS
}