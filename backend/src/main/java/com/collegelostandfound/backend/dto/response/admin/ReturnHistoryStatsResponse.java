package com.collegelostandfound.backend.dto.response.admin;

public class ReturnHistoryStatsResponse {

    private long bagsReturned;
    private long phonesReturned;
    private long idCardsReturned;
    private long walletsReturned;
    private long keysReturned;
    private long docsReturned;
    private long othersReturned;

    public ReturnHistoryStatsResponse() {
    }

    public ReturnHistoryStatsResponse(long bagsReturned, long phonesReturned, long idCardsReturned, long walletsReturned, long keysReturned, long docsReturned, long othersReturned) {
        this.bagsReturned = bagsReturned;
        this.phonesReturned = phonesReturned;
        this.idCardsReturned = idCardsReturned;
        this.walletsReturned = walletsReturned;
        this.keysReturned = keysReturned;
        this.docsReturned = docsReturned;
        this.othersReturned = othersReturned;
    }

    public long getBagsReturned() {
        return bagsReturned;
    }

    public void setBagsReturned(long bagsReturned) {
        this.bagsReturned = bagsReturned;
    }

    public long getPhonesReturned() {
        return phonesReturned;
    }

    public void setPhonesReturned(long phonesReturned) {
        this.phonesReturned = phonesReturned;
    }

    public long getIdCardsReturned() {
        return idCardsReturned;
    }

    public void setIdCardsReturned(long idCardsReturned) {
        this.idCardsReturned = idCardsReturned;
    }

    public long getWalletsReturned() {
        return walletsReturned;
    }

    public void setWalletsReturned(long walletsReturned) {
        this.walletsReturned = walletsReturned;
    }

    public long getKeysReturned() {
        return keysReturned;
    }

    public void setKeysReturned(long keysReturned) {
        this.keysReturned = keysReturned;
    }

    public long getDocsReturned() {
        return docsReturned;
    }

    public void setDocsReturned(long docsReturned) {
        this.docsReturned = docsReturned;
    }

    public long getOthersReturned() {
        return othersReturned;
    }

    public void setOthersReturned(long othersReturned) {
        this.othersReturned = othersReturned;
    }
}
