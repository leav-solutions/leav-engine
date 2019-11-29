export async function wait(duration = 0) {
    return new Promise(resolve => setTimeout(resolve, duration));
}
