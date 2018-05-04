export function transStatus (status) {
    if('NEW' === status) {
        return '待确认';
    }
    if('CONFIRM' === status || 'DISPATCHING' === status) {
        return '已确认';
    }
    if('FINISHED' === status) {
        return '已完成';
    }
}

export function transStep (status) {
    if('NEW' === status) {
        return 0;
    }
    if('CONFIRM' === status) {
        return 1;
    }
    if('DISPATCHING' === status) {
        return 2;
    }
    if('FINISHED' === status) {
        return 3;
    }
    return 0;
}
