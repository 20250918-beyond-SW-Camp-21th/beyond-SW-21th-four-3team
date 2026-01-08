export const statisticsApi = {
    getStatistics: async (period) => {
        console.log(`Get stats for ${period}`);
        return {
            todo: 15,
            inProgress: 10,
            done: 25
        };
    }
};
