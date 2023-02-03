export default class UserDTO {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.diskSpace = model.diskSpace;
        this.usedSpace = model.usedSpace;
        this.avatar = model.avatar;
        this.files = model.files;
    }
}

