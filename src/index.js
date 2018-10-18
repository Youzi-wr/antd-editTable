import React from "react";
import ReactDOM from "react-dom";
import style from "./index.scss";
import "antd/dist/antd.css";
import data from "./data.js";
import {
  Table,
  Checkbox,
  Input,
  Divider,
  Select,
  Button,
  notification,
  Form
} from "antd";

const sty = style;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const fruitList = [
  {
    value: "apple",
    label: "苹果"
  },
  {
    value: "banana",
    label: "香蕉"
  },
  {
    value: "orange",
    label: "橘子"
  }
];

class Client extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isRowOpen: false, //当前是否处于编辑状态（有且只有一行可编辑）
      locale: {
        emptyText: "暂无数据"
      },
      data: [],
      //正在编辑数据的缓存以便取消动作
      editCacheData: []
    };

    this.columns = [
      {
        title: "名称",
        key: "name", // todo 校验
        dataIndex: "name",
        render: (name, record) => {
          return record.type !== "view" ? (
            <Input
              defaultValue={name}
              onChange={e => this.nameChange(e, record)}
            />
          ) : (
            name
          );
        }
      },
      {
        title: "评价一下",
        width: 120,
        key: "evaluate",
        dataIndex: "evaluate",
        render: (evaluate, record) => {
          return record.type !== "view" ? (
            <Select
              onChange={e => this.evaluateChange(e, record)}
              defaultValue={evaluate ? "1" : "0"}
              style={{ width: "100%" }}
            >
              <Option value="1">不好吃</Option>
              <Option value="0">好吃</Option>
            </Select>
          ) : evaluate ? (
            "不好吃"
          ) : (
            "好吃"
          );
        }
      },
      {
        title: "水果",
        width: "25%",
        key: "fruitTypes",
        dataIndex: "fruitTypes",
        render: (fruitTypes, record) => {
          return (
            <CheckboxGroup
              onChange={e => this.fruitTypesChange(e, record)}
              disabled={record.type !== "view" ? false : true}
              options={fruitList}
              defaultValue={fruitTypes}
            />
          );
        }
      },
      {
        title: "价格",
        width: "38%",
        key: "price", // todo 校验
        render: record => {
          return record.type !== "view" ? (
            <Input
              defaultValue={record.price}
              onChange={e => this.priceChange(e, record)}
            />
          ) : (
            record.price
          );
        }
      },
      {
        title: "操作",
        render: record => (
          <span>
            {record.type === "new" && (
              <span>
                <a href="javascript:;" onClick={e => this.addSubmit(record)}>
                  完成
                </a>
                <Divider type="vertical" />
                <a href="javascript:;" onClick={e => this.removeAdd(record)}>
                  取消
                </a>
              </span>
            )}
            {record.type === "edit" && (
              <span>
                <a href="javascript:;" onClick={e => this.editSubmit(record)}>
                  完成
                </a>
                <Divider type="vertical" />
                <a href="javascript:;" onClick={e => this.giveUpUpdata(record)}>
                  取消
                </a>
                <Divider type="vertical" />
                <a href="javascript:;" onClick={e => this.delete(record)}>
                  删除
                </a>
              </span>
            )}
            {record.type === "view" && (
              <span>
                <a href="javascript:;" onClick={e => this.edit(record)}>
                  编辑
                </a>
                <Divider type="vertical" />
                <a href="javascript:;" onClick={e => this.delete(record)}>
                  删除
                </a>
              </span>
            )}
          </span>
        ),
        width: 150
      }
    ];
  }
  componentDidMount() {
    this.initRowType(data.getList);
  }
  initRowType(data) {
    for (let item of data) {
      item["type"] = "view";
    }
    this.updateDataSource(data);
  }
  // ---------------------- cell change start------------------
  nameChange(e, record) {
    this.updateEditCacheData(record, { name: e.target.value });
  }
  evaluateChange(e, record) {
    this.updateEditCacheData(record, { evaluate: e == "1" ? true : false });
  }
  fruitTypesChange(e, record) {
    this.updateEditCacheData(record, { fruitTypes: e });
  }
  priceChange(e, record) {
    this.updateEditCacheData(record, { price: e.target.value });
  }
  // ---------------------- cell change end------------------
  updateEditCacheData(record, obj) {
    let { editCacheData } = this.state;
    let cacheData =
      record.id === editCacheData.id
        ? { ...editCacheData, ...obj }
        : { ...record, ...obj };
    this.setState({ editCacheData: cacheData });
  }
  updateDataSource(newData, isAddDisabled) {
    let isRowOpen =
      typeof isAddDisabled == "boolean"
        ? isAddDisabled
        : newData.some(item => item.type === "new" || item.type === "edit");
    this.setState({
      isRowOpen,
      data: newData
    });
  }
  addRow = () => {
    let { data } = this.state;
    let newRecord = {
      fruitTypes: ["apple", "banana", "orange"],
      name: "",
      evaluate: true,
      price: "",
      type: "new",
      id: ""
    };

    data.push(newRecord);
    this.updateDataSource(data);
  };
  addSubmit(record) {
    let { data, editCacheData } = this.state;
    // console.log(editCacheData);
    setTimeout(res => {
      editCacheData.type = "view";
      data.pop();
      data.push(editCacheData);
      this.updateDataSource(data);
      notification["success"]({ message: "添加成功！" });
    }, 500);
  }
  removeAdd(record) {
    let { data } = this.state;
    data.pop();
    this.updateDataSource(data);
  }
  editSubmit(record) {
    let { data, editCacheData } = this.state;

    setTimeout(res => {
      //将cacheData更新到dataSource
      let newData = data.map(item => {
        if (item.id === editCacheData.id) {
          item = Object.assign({}, editCacheData);
          item.type = "view";
        }
        return item;
      });
      this.updateDataSource(newData);
      notification["success"]({ message: "修改成功！" });
    }, 500);
  }
  giveUpUpdata(record) {
    let { data } = this.state;
    let editRow = data.find(item => item.id === record.id);
    editRow.type = "view";
    this.updateDataSource(data);
  }
  delete(record) {
    let { data } = this.state;
    console.log(record);
    setTimeout(res => {
      let index = data.findIndex(item => item.id === record.id);
      data.splice(index, 1);
      this.updateDataSource(data);
      notification["success"]({ message: "删除成功！" });
    });
  }
  edit(record) {
    let { data } = this.state;
    let newData = data.filter(item => {
      if (item.id === record.id) {
        item.type = "edit";
        return item;
      } else if (item.type !== "new") {
        item.type = "view";
        return item;
      }
    });
    this.updateDataSource(newData, true);
  }
  render() {
    const { data, locale, isRowOpen } = this.state;

    return (
      <div className={sty.client}>
        <div className={sty.clientWrap}>
          <Button
            style={{ marginBottom: "10px" }}
            disabled={isRowOpen}
            onClick={this.addRow}
          >
            + 添加
          </Button>
          <Table
            locale={locale}
            bordered
            rowKey={record => record.id}
            size={"middle"}
            columns={this.columns}
            dataSource={data}
            pagination={false}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Client />, document.getElementById("container"));
