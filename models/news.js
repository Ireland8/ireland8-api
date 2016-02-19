var mongoose = require('mongoose')
var Schema = mongoose.Schema

var NewsSchema = new Schema({
    title: { type: String, required: true, lowercase: true, trim: true, index: { unique: true } },
    author: { type: String, required: true },
    digest: { type: String, trim: true},
    content_source_url:{ type: String},
    url:{ type: String, required: true},
    thumb_url:{ type: String},
    update_time: { type: Number, required: true}
});

var News = mongoose.model('News',NewsSchema);

module.exports={
    News: News
}