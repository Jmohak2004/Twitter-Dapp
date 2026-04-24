const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedTwitter", function () {
  async function deploy() {
    const [alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DecentralizedTwitter");
    const twitter = await Factory.deploy();
    return { twitter, alice, bob };
  }

  it("creates posts and tracks count", async function () {
    const { twitter, alice } = await deploy();
    const tx = await twitter.connect(alice).createPost("hello world");
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);
    await expect(tx)
      .to.emit(twitter, "PostCreated")
      .withArgs(1n, alice.address, "hello world", BigInt(block.timestamp));

    expect(await twitter.postCount()).to.equal(1n);
    const p = await twitter.getPost(1n);
    expect(p.author).to.equal(alice.address);
    expect(p.content).to.equal("hello world");
    expect(p.exists).to.equal(true);
  });

  it("likes and unlikes", async function () {
    const { twitter, alice, bob } = await deploy();
    await twitter.connect(alice).createPost("x");
    await twitter.connect(bob).likePost(1n);
    expect((await twitter.getPost(1n)).likeCount).to.equal(1n);
    expect(await twitter.hasLiked(bob.address, 1n)).to.equal(true);
    await twitter.connect(bob).unlikePost(1n);
    expect((await twitter.getPost(1n)).likeCount).to.equal(0n);
  });

  it("only author can delete", async function () {
    const { twitter, alice, bob } = await deploy();
    await twitter.connect(alice).createPost("bye");
    await expect(twitter.connect(bob).deletePost(1n)).to.be.revertedWithCustomError(
      twitter,
      "NotPostAuthor"
    );
    await twitter.connect(alice).deletePost(1n);
    expect((await twitter.getPost(1n)).exists).to.equal(false);
  });

  it("sets unique profile handle", async function () {
    const { twitter, alice, bob } = await deploy();
    await twitter.connect(alice).setProfile("alice_dev");
    expect(await twitter.profileHandle(alice.address)).to.equal("alice_dev");
    await expect(twitter.connect(bob).setProfile("alice_dev")).to.be.revertedWithCustomError(
      twitter,
      "HandleTaken"
    );
  });
});
