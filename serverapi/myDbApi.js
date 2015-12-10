var level = require('level');
var db = level('./mydb');
function put(key, value, callback) {
    if (key && value) {
        db.put(key, value, function (error) {
          callback&&callback(error);
        })
    } else {
      callback&&callback('no key or value');
    }
}

//获取
function get(key, callback) {
    if (key) {
        db.get(key, function (error, value) {
          callback&&callback(error, value);
        })
    } else {
      callback&&callback('no key', key);
    }
}
//删除
function del(key, callback) {
    if (key) {
        db.del(key, function (error) {
          callback&&callback(error);
        })
    } else {
      callback&&callback('no key');
    }
}
//批量操作
function batch(arr, callback) {
    if (Array.isArray(arr)) {
        var batchList = [];
        arr.forEach(item)
        {
            var listMember = {};
            if (item.hasOwnProperty('type')) {
                listMember.type = item.type;
            }
            if (item.hasOwnProperty('key')) {
                listMember.key = item.key;
            }
            if (item.hasOwnProperty('value')) {
                listMember.value = item.value;
            }
            if (listMember.hasOwnProperty('type') && listMember.hasOwnProperty('key') && listMember.hasOwnProperty('value')) {
                batchList.push(listMember);
            }
        }
        if (batchList && batchList.length > 0) {
            db.batch(batchList, function (error) {
              callback&&callback(error, batchList);
            })
        } else {
          callback&&callback('array Membre format error');
        }
    } else {
      callback&&callback('not array');
    }
}
//查找 (支持前置匹配)
function find(find, callback) {
    var option = {keys: true, values: true, revers: false, limit: 20, fillCache: true};
    if (!find)
        return callback('nothing', null);
    else {
        if (find.prefix) {
            option.start = find.prefix;
            option.end = find.prefix.substring(0, find.prefix.length - 1)
                + String.fromCharCode(find.prefix[find.prefix.length - 1].charCodeAt() + 1);
        }

        if (find.limit)
            option.limit = find.limit;

        db.createReadStream(option).on('data',function (data) {
            data&&callback&&callback(data.key, data.value);
        }).on('error',function (err) {
            }).on('close',function () {
            }).on('end', function () {
                return callback&&callback(null, Date.now());
            });
    }
}

exports.put = put;
exports.get = get;
exports.del = del;
exports.find = find;
exports.batch = batch;
